import { NextResponse } from "next/server";

function present(key: string) {
  return Boolean(process.env[key]?.trim());
}

function value(key: string, fallback = "") {
  return process.env[key]?.trim() || fallback;
}

export async function GET() {
  const authKeys = ["MICROSOFT_TENANT_ID", "MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"];
  const targetKeys = ["SHAREPOINT_SITE_ID", "SHAREPOINT_DRIVE_ID", "SHAREPOINT_HOSTNAME", "SHAREPOINT_SITE_PATH"];
  const missingAuth = authKeys.filter((key) => !present(key));
  const missingTarget = targetKeys.filter((key) => !present(key));

  const targetConfigured = missingTarget.length === 0;
  const runtimeWritable = targetConfigured && missingAuth.length === 0;

  return NextResponse.json({
    mode: runtimeWritable ? "Runtime ready" : targetConfigured ? "Target ready, auth pending" : "Target missing",
    updatedAt: new Date().toISOString(),
    sharePoint: {
      configured: targetConfigured,
      writable: runtimeWritable,
      hostname: value("SHAREPOINT_HOSTNAME"),
      sitePath: value("SHAREPOINT_SITE_PATH"),
      siteId: value("SHAREPOINT_SITE_ID"),
      driveId: value("SHAREPOINT_DRIVE_ID"),
      libraryName: value("SHAREPOINT_LIBRARY_NAME", "Documents"),
      backendFolder: value("SHAREPOINT_BACKEND_FOLDER", "Portal Backend"),
      evidenceFolder: value("SHAREPOINT_EVIDENCE_FOLDER", "Portal Backend/Evidence Uploads"),
      taskEvidenceFolder: value("SHAREPOINT_TASK_EVIDENCE_FOLDER", "Portal Backend/Task Evidence"),
      reportsFolder: value("SHAREPOINT_REPORTS_FOLDER", "Portal Backend/Reports and Exports"),
      syncLogsFolder: value("SHAREPOINT_SYNC_LOGS_FOLDER", "Portal Backend/Sync Logs"),
      webUrl: targetConfigured
        ? `https://${value("SHAREPOINT_HOSTNAME")}${value("SHAREPOINT_SITE_PATH")}`
        : "",
    },
    oneDrive: {
      policy: value("ONEDRIVE_POLICY", "selective_publish_only"),
      publishFolder: value("ONEDRIVE_PUBLISH_FOLDER", "Portal Backend/Published from OneDrive"),
      privateByDefault: true,
      detail:
        "Personal OneDrive content is not synced wholesale. Staff choose individual files to copy into the shared publish folder.",
    },
    mailbox: {
      address: value("CONTACT_MAILBOX_ADDRESS", "contact@violetproject.co.uk"),
      configured: present("CONTACT_MAILBOX_ADDRESS"),
    },
    services: {
      googleMapsConfigured: present("GOOGLE_MAPS_API_KEY"),
      openAiConfigured: present("OPENAI_API_KEY"),
    },
    missing: {
      target: missingTarget,
      auth: missingAuth,
    },
  });
}
