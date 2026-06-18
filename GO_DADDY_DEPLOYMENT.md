# GoDaddy Deployment

This portal can run on GoDaddy only if it is deployed to GoDaddy Node.js Hosting or another Node-capable app host. It should not be pasted into the ordinary GoDaddy website builder.

## Recommended: Deploy From GitHub

Now that the app is connected to GitHub, GoDaddy should build from the repository instead of repeated zip uploads.

The source `package.json` includes the same GoDaddy fixes as the working `v7` zip:

- `npm run build` uses `node godaddy-build.js`
- `npm start` uses `next start`
- all required build/runtime packages are in `dependencies`
- the build forces production mode
- the build wrapper works around GoDaddy's `EXDEV` file-system rename issue

After each code change:

```powershell
pnpm check
pnpm build:next
git add .
git commit -m "Update Violet Project portal"
git push
```

Then trigger a GoDaddy redeploy from the GitHub-connected app.

## Fallback: Create The Upload Zip

From this folder:

```powershell
pnpm package:godaddy
```

The script creates:

```txt
.deploy/violet-project-portal-godaddy.zip
```

The zip excludes `node_modules`, `.next`, `.deploy`, and private `.env` files. It keeps `.env.example` so the required settings are documented.

## Upload To GoDaddy Node.js Hosting

1. Open GoDaddy Node.js Hosting.
2. Upload `.deploy/violet-project-portal-godaddy.zip`.
3. Let GoDaddy install dependencies and run the build/start scripts.
4. Add the real environment variables from `.env.example` in the GoDaddy app settings.
5. Publish the preview when the portal loads.
6. Connect `portal.violetproject.co.uk` as the app domain.

## Required Live Settings

Do not upload `.env.local`. Add these values in the hosting dashboard:

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

## After The Domain Changes

Update any Microsoft app registration redirect URLs, SharePoint trusted origins, email links, QR codes, and portal settings to use:

```txt
https://portal.violetproject.co.uk
```

## Smoke Test

After launch, open:

```txt
https://portal.violetproject.co.uk/api/health
```

It should return `ok: true`.
