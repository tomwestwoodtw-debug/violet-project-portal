import { NextRequest, NextResponse } from "next/server";

type EmailDraftRequest = {
  mode?: "draft" | "warmer" | "shorter" | "formal" | "melanie-email" | "summarise";
  currentDraft?: string;
  melanieInstruction?: string;
  originalEmailContext?: string;
  email: {
    category: string;
    subject: string;
    from: string;
    to: string;
    receivedAt: string;
    waitingDays: number;
    volunteerNameHint: string;
    snippet: string;
    owner: string;
    nextAction: string;
    relatedRegion?: string;
  };
  linkedName: string;
  followUpStatus: string;
};

function localSmartDraft({ email, linkedName, followUpStatus }: EmailDraftRequest) {
  const person = linkedName && linkedName !== "Needs review" ? linkedName : email.volunteerNameHint;
  const greeting = person ? `Hi ${person.split(" ")[0]},` : "Hello,";
  const wait = email.waitingDays > 3
    ? `Sorry you have been waiting ${email.waitingDays} days for a response.`
    : "Thank you for getting in touch.";
  const region = email.relatedRegion ? ` I have also linked this to the ${email.relatedRegion} region record.` : "";

  const categoryLines: Record<string, string> = {
    DBS: "We have received the DBS update and will check it against the correct volunteer record before updating the portal.",
    Training: "We have received the training update and will check the completion details before updating the volunteer record.",
    Certificate: "We can see the training has been completed and the certificate is still outstanding. We will chase this and update you when it has been issued.",
    Fundraising: "Thank you for supporting Violet Project. We will confirm the fundraising record and make sure the appropriate thank-you is sent.",
    Contact: "Thank you for the event contact details. We will pass this to the right person and confirm the next step.",
    Expense: "We have received the expense message and will check the claim and any evidence attached.",
    Event: "Thank you for the event update. We will check the event record and confirm arrangements where needed.",
    General: "We have received your message and will make sure it reaches the right person.",
  };

  return [
    greeting,
    "",
    wait,
    "",
    categoryLines[email.category] || categoryLines.General,
    region.trim(),
    "",
    `Next action on our side: ${email.nextAction}`,
    `Current status: ${followUpStatus}.`,
    "",
    "Kind regards,",
    "Violet Project",
  ].filter(Boolean).join("\n");
}

function extractOutputText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";
  const maybe = data as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown }> }> };
  if (typeof maybe.output_text === "string") return maybe.output_text;
  return maybe.output
    ?.flatMap((item) => item.content || [])
    .map((content) => (typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n") || "";
}

function localRewrite(body: EmailDraftRequest, fallbackDraft: string) {
  const mode = body.mode || "draft";
  const draft = (body.currentDraft || fallbackDraft).trim();
  const instruction = body.melanieInstruction?.trim();
  const context = body.originalEmailContext?.trim() || body.email.snippet;
  const greetingMatch = draft.match(/^(Hi [^,\n]+,|Hello,)/);
  const greeting = greetingMatch?.[1] || "Hello,";
  const signoff = "Kind regards,\nViolet Project";

  if (mode === "summarise") {
    return [
      "Summary",
      "",
      `- Subject: ${body.email.subject}`,
      `- From: ${body.email.from}`,
      `- Linked to: ${body.linkedName || body.email.volunteerNameHint || "Needs review"}`,
      `- Waiting: ${body.email.waitingDays} day${body.email.waitingDays === 1 ? "" : "s"}`,
      `- Melanie's instruction: ${instruction || "None provided"}`,
      `- Next action: ${body.email.nextAction}`,
      context ? `- Original email: ${context.slice(0, 240)}` : "",
    ].filter(Boolean).join("\n");
  }

  if (mode === "melanie-email") {
    return [
      greeting,
      "",
      instruction
        ? `Thank you for your email. Melanie has asked us to pick this up and the next step is: ${instruction}`
        : "Thank you for your email. Melanie has asked us to pick this up and we will review the original message before replying fully.",
      "",
      context ? `For reference, we have your original message about ${body.email.subject}.` : "",
      "",
      "We will update the relevant Violet Project record and come back to you if we need anything else.",
      "",
      signoff,
    ].filter(Boolean).join("\n");
  }

  if (mode === "shorter") {
    return [
      greeting,
      "",
      "Thank you for getting in touch. We have picked this up and will update the relevant Violet Project record.",
      "",
      `Next step: ${instruction || body.email.nextAction}`,
      "",
      signoff,
    ].join("\n");
  }

  if (mode === "formal") {
    return [
      "Hello,",
      "",
      "Thank you for your email.",
      "",
      `We have received your message regarding ${body.email.subject}. We will review this against the relevant Violet Project record and complete the required next action.`,
      "",
      instruction ? `Instruction being actioned: ${instruction}` : `Next action: ${body.email.nextAction}`,
      "",
      "We will contact you again if any further information is required.",
      "",
      signoff,
    ].join("\n");
  }

  if (mode === "warmer") {
    return [
      greeting,
      "",
      "Thank you for getting in touch, and sorry if you have been waiting on this.",
      "",
      instruction
        ? `We have picked this up from Melanie's note and will now action this: ${instruction}`
        : "We have picked this up and will make sure it gets to the right person.",
      "",
      "We appreciate you bearing with us, and we will come back to you if we need anything else.",
      "",
      signoff,
    ].join("\n");
  }

  return draft;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EmailDraftRequest;
  const fallbackDraft = localSmartDraft(body);
  const localDraft = body.mode && body.mode !== "draft" ? localRewrite(body, fallbackDraft) : fallbackDraft;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      draft: localDraft,
      source: body.mode && body.mode !== "draft" ? "Local rewrite" : "Local smart draft",
      note: "Add OPENAI_API_KEY to .env.local to use model-generated drafting and rewrites.",
    });
  }

  const prompt = [
    body.mode && body.mode !== "draft"
      ? `Rewrite the Violet Project email draft using this mode: ${body.mode}.`
      : "Draft a concise, warm, professional email reply for Violet Project.",
    "Do not invent facts. Do not promise that something is complete unless the context says it is.",
    "Do not send the email. Return only the email body.",
    "If asked to summarise, return a short practical admin summary rather than a reply.",
    "",
    JSON.stringify(body, null, 2),
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_EMAIL_DRAFT_MODEL || "gpt-4.1-mini",
        input: prompt,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        draft: localDraft,
        source: body.mode && body.mode !== "draft" ? "Local rewrite" : "Local smart draft",
        note: "The AI draft service was unavailable, so a local version was generated.",
      });
    }

    const data = await response.json();
    const draft = extractOutputText(data).trim();

    return NextResponse.json({
      draft: draft || localDraft,
      source: draft ? "AI draft" : "Local smart draft",
      note: draft ? "Generated from the email body, linked record and follow-up context. Review before sending." : "The AI response was empty, so a local draft was generated.",
    });
  } catch {
    return NextResponse.json({
      draft: localDraft,
      source: body.mode && body.mode !== "draft" ? "Local rewrite" : "Local smart draft",
      note: "The AI draft service could not be reached, so a local version was generated.",
    });
  }
}
