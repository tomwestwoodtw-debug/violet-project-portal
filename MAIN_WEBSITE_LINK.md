# Main Website Portal Link

The portal should be accessed from the main Violet Project website as a separate staff/volunteer area.

## Button

Button text:

```txt
Staff & Volunteer Portal
```

Current URL:

```txt
https://violet-project-portal.vercel.app/
```

Final URL after DNS:

```txt
https://portal.violetproject.co.uk
```

Status on 2026-06-18: the GoDaddy website has been published with a `Staff & Volunteer Portal` link in navigation and footer, pointing to `https://violet-project-portal.vercel.app/`. GoDaddy DNS now has `A portal 76.76.21.21`, Vercel has issued the certificate, and `https://portal.violetproject.co.uk/api/health` is live. The remaining website task is to swap the published link to the final URL: `https://portal.violetproject.co.uk`.

## Recommended Placement

Add the button in the main site header/navigation and repeat it once near the footer or contact area.

Do not label it as TapMySafetyPlan. Do not mention SharePoint, backend exports, Vercel, GoDaddy, or Microsoft to volunteers.

## Plain HTML Fallback

If the GoDaddy editor allows custom HTML, this is enough:

```html
<a href="https://violet-project-portal.vercel.app/" target="_blank" rel="noopener">
  Staff & Volunteer Portal
</a>
```

After the portal domain is connected, change the link to:

```html
<a href="https://portal.violetproject.co.uk" target="_blank" rel="noopener">
  Staff & Volunteer Portal
</a>
```

## GoDaddy Website Builder Steps

1. Open the Violet Project website in GoDaddy Websites + Marketing.
2. Edit the header/navigation.
3. Add a button or navigation link called `Staff & Volunteer Portal`.
4. Set the link to `https://violet-project-portal.vercel.app/`.
5. Publish the website.
6. Once `portal.violetproject.co.uk` is live, update the same link to the final domain.

## GoDaddy DNS Step

This DNS record has been added for the final portal subdomain:

```txt
Type: A
Host: portal
Value: 76.76.21.21
TTL: default
```
