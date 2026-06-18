# Violet Project Portal

Standalone Next.js app for Violet Project's staff, volunteer and admin portal.

The public Violet Project website can stay on GoDaddy while this portal runs as its own app, normally at:

```txt
https://portal.violetproject.co.uk
```

## Local Development

```bash
pnpm install
pnpm dev -- --port 3132
```

Open:

```txt
http://localhost:3132
```

The old local path `/violet-project` redirects to `/` so existing test links still work.

## Private Settings

Copy `.env.example` to `.env.local` and fill in real private values there. Do not commit `.env.local`.

Key live settings:

- `NEXT_PUBLIC_PORTAL_BASE_URL=https://portal.violetproject.co.uk`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- SharePoint site and drive IDs
- `GOOGLE_MAPS_API_KEY`
- `OPENAI_API_KEY`

## Deployment Shape

- Public website: `violetproject.co.uk`
- Portal app: `portal.violetproject.co.uk`
- Data/documents: Violet Project Microsoft 365 / SharePoint
- Email/calendar: Violet Project Microsoft 365

## App Hosting

This is a real Next.js portal with API routes, private settings and Microsoft/Google/OpenAI integrations, so it needs app hosting. It should not be embedded into the normal GoDaddy website builder.

For GoDaddy, use GoDaddy Node.js Hosting connected to GitHub where possible. The app includes a GoDaddy build wrapper because the GoDaddy beta environment can fail Next.js builds during internal cross-device file moves.

Local checks:

```bash
pnpm check
pnpm build:next
```

For emergency zip uploads:

```bash
pnpm package:godaddy
```

That creates `.deploy/violet-project-portal-godaddy.zip` for upload. Add the real environment variables in the hosting dashboard, not in the zip.

See `GO_DADDY_DEPLOYMENT.md` for the launch steps.
