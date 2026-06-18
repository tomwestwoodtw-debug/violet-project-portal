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

1. Add the `Staff & Volunteer Portal` button/link to the main Violet Project website.
2. Connect `portal.violetproject.co.uk` to the Vercel deployment.
3. Add the production environment variables in Vercel.
4. Get Microsoft admin consent for the app registration.
5. Create SharePoint lists/libraries for expenses, hours, volunteers, tasks, approvals, contacts, events, resources, messages and audit logs.
6. Wire the portal screens to Microsoft Graph/SharePoint so staff never need to open SharePoint directly.
7. Replace any remaining mock-only actions with real save/approve/update flows.

## Prompt For The Next Chat

```txt
Continue the Violet Project portal from C:\Users\tomwe\Documents\Codex\2026-05-04\i-m-working-on-a-project\violet-project-portal. Read HANDOVER.md first. Live portal is https://violet-project-portal.vercel.app/ and repo is https://github.com/tomwestwoodtw-debug/violet-project-portal. Next priority: make the portal accessible from the main Violet Project website, then connect portal.violetproject.co.uk to Vercel, then configure Microsoft/SharePoint/Outlook secrets.
```
