# Violet Project Portal Handover

## Current Live Access

Use this now:

```txt
https://violet-project-portal.vercel.app/
```

The intended final public address is:

```txt
https://portal.violetproject.co.uk
```

Status on 2026-06-18:

- `portal.violetproject.co.uk` has been added to the Vercel project and the latest production deployment is aliased to it.
- GoDaddy DNS has an `A` record with host `portal` pointing to `76.76.21.21`.
- Public DNS resolves `portal.violetproject.co.uk` to `76.76.21.21`.
- A Vercel certificate has been issued for `portal.violetproject.co.uk`, and `https://portal.violetproject.co.uk/api/health` returns `ok: true`.
- The main Violet Project website has a published `Staff & Volunteer Portal` navigation/footer link pointing to `https://violet-project-portal.vercel.app/`.
- The live health endpoint is passing at `https://violet-project-portal.vercel.app/api/health`.
- The live Microsoft status endpoint reports SharePoint target and mailbox configured, with Microsoft auth still pending.

Keep the existing public website at `violetproject.co.uk`. Add a clear button or nav link from the main site to the portal rather than trying to embed the portal inside the GoDaddy website builder.

Recommended button text:

```txt
Staff & Volunteer Portal
```

Current link target:

```txt
https://violet-project-portal.vercel.app/
```

Future link target after DNS is connected:

```txt
https://portal.violetproject.co.uk
```

## Repository

GitHub:

```txt
https://github.com/tomwestwoodtw-debug/violet-project-portal
```

Local project:

```txt
C:\Users\tomwe\Documents\Codex\2026-05-04\i-m-working-on-a-project\violet-project-portal
```

Branch:

```txt
main
```

## Deployment Position

Vercel is the working live deployment and should be treated as the reliable launch route.

GoDaddy Node.js Hosting has built the app from GitHub before, but publish/preview has been unreliable in the GoDaddy beta hosting dashboard. Do not spend time re-uploading zip files unless GoDaddy gives a specific build log. Use Vercel for the working portal and point `portal.violetproject.co.uk` at it.

## What Is Built

- Standalone Violet Project portal, separate from TapMySafetyPlan.
- Volunteer, manager and admin modes.
- Real mode and demo mode.
- Real mode uses empty states instead of fake data.
- Volunteer hub: tasks, events, expenses, hours, resources, messages, profile.
- Management hub: delegated tasks, approvals, compact calendar, resources, OneDrive/share publishing placeholders, email/task queues.
- Admin hub: forwarded email intake, SLA queues, contact CRM, VIP/event outreach, certificates/training, fundraising, service/region breakdowns.
- Launch readiness and client settings screens.
- API routes for health, Microsoft status, travel distance, and email draft generation.
- GoDaddy-specific build wrapper remains in place for compatibility.

## What Is Not Fully Connected Yet

These are intentionally staged as interfaces/placeholders until the real tenant settings are approved:

- Microsoft sign-in / app consent.
- SharePoint list creation and live read/write.
- Outlook mailbox/calendar sync.
- OneDrive document picker/upload.
- Google Maps mileage calculation key.
- OpenAI smart response key.

The Microsoft consent attempt hit:

```txt
Need admin approval
```

The tenant/app registration needs an authorised Microsoft 365 admin to grant consent before SharePoint and Outlook can be live.

Production Vercel now has the non-secret/target configuration values from `.env.local`, including SharePoint site/drive/folder settings, OneDrive publish policy, contact mailbox and `OPENAI_EMAIL_DRAFT_MODEL`.

Still missing in Vercel production because no values were available locally:

```txt
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
GOOGLE_MAPS_API_KEY
OPENAI_API_KEY
```

## Required Environment Variables

Do not commit real secrets. Add these in Vercel or the final app host:

```txt
NEXT_PUBLIC_PORTAL_BASE_URL=https://portal.violetproject.co.uk
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
SHAREPOINT_HOSTNAME=netorgft10925415.sharepoint.com
SHAREPOINT_SITE_PATH=/sites/VioletProjectOffice
SHAREPOINT_SITE_ID=
SHAREPOINT_DRIVE_ID=
GOOGLE_MAPS_API_KEY=
OPENAI_API_KEY=
CONTACT_MAILBOX_ADDRESS=contact@violetproject.co.uk
```

## Useful Commands

```powershell
cd C:\Users\tomwe\Documents\Codex\2026-05-04\i-m-working-on-a-project\violet-project-portal
pnpm install
pnpm dev -- --port 3132
pnpm check
pnpm build:next
git status -sb
git push
```

Deploy to Vercel:

```powershell
npx vercel --prod --yes
```

Check live health:

```txt
https://violet-project-portal.vercel.app/api/health
```

## Next Priorities

1. Update the published main website link from `https://violet-project-portal.vercel.app/` to `https://portal.violetproject.co.uk`.
2. Add the remaining production secrets in Vercel: Microsoft tenant/client/secret, Google Maps key and OpenAI key.
3. Get Microsoft admin consent for the app registration.
4. Create SharePoint lists/libraries for expenses, hours, volunteers, tasks, approvals, contacts, events, resources, messages and audit logs.
5. Wire the portal screens to Microsoft Graph/SharePoint so staff never need to open SharePoint directly.
6. Replace any remaining mock-only actions with real save/approve/update flows.

## Prompt For The Next Chat

```txt
Continue the Violet Project portal from C:\Users\tomwe\Documents\Codex\2026-05-04\i-m-working-on-a-project\violet-project-portal. Read HANDOVER.md first. Live portal is https://violet-project-portal.vercel.app/ and repo is https://github.com/tomwestwoodtw-debug/violet-project-portal. Next priority: make the portal accessible from the main Violet Project website, then connect portal.violetproject.co.uk to Vercel, then configure Microsoft/SharePoint/Outlook secrets.
```
