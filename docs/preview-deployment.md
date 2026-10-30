# Public preview deployment and ongoing development

Prepared 30 October 2026 for v0.5.0. The app has not been deployed by the assistant. Application changes and account setup remain user-applied from chat.

## What is ready

The applied React/Vite app has real Viewer and Studio addresses, refresh/history support, owner sign-in, per-universe publication, character details and the featured Marvel card. vercel.json supplies the single-page-app fallback. TypeScript, lint, production build and isolated browser checks pass. Live read-only role checks hide private timeline entries from guests and non-owners. The 555 kB minified bundle advisory remains for a later measured performance pass.

The code is ready for a first hosted check. Hosted sign-in/editing, direct-URL refresh and real-phone usability have not yet been tested. Do those before broad outreach.

## Hosting choice

Vercel Hobby suits this personal non-commercial project. It is free within its allowances; usage limits can pause a feature until its quota resets. Current limits include 100 deployments per day and 100 GB of fast data transfer. Recheck terms before monetisation. [Hobby plan](https://vercel.com/docs/plans/hobby), [limits](https://vercel.com/docs/limits).

Cloudflare Pages is another suitable static-site host, advertising unlimited static requests/bandwidth with 500 free builds per month. It is an alternative, not a required migration. [Pages](https://www.cloudflare.com/products/pages/), [build limits](https://developers.cloudflare.com/pages/platform/limits/).

Vercel serves the frontend; Supabase continues to store data and handle sign-in. No Next.js conversion, additional backend or paid domain is needed for the first deployment.

## Prepare locally

1. Finish the Plotstrand branding edits from chat: generated app-bar logo, PNG favicon/Apple icon and contextual browser titles. The base title Plotstrand — Fictional Timelines, description, fonts and fan-made public-preview introduction are already present. Keep the new public assets/font licences in the deployment. Remove the unused starter favicon.svg and icons.svg after updating references.
2. Set the package name with npm pkg set name=plotstrand, then synchronise the version with npm version 0.5.0 --no-git-tag-version. This updates package.json and package-lock.json without creating a Git tag. The repository/folder name can stay unchanged.
3. Run npm run lint and npm run build after those edits.
4. Review and commit the release changes, including vercel.json and the new branding assets, then push to main on GitHub. Keep .env local; it is currently ignored and untracked. package-lock.json and .env.example are already tracked.
5. Decide which universes should be public, including incomplete examples. The next feature pass will add content-status badges independently of Public/Private; unfinished does not have to mean private. Keep test timelines private. No publication values were changed by this branding pass.

## First Vercel deployment

1. Create a Vercel account using the GitHub account that owns MateuszS6/Fictional-Media-Timeline-Viewer. Choose Hobby/personal use.
2. Choose Add New > Project and connect/import that repository. Grant access to the selected repository; no need to grant every repository.
3. Use the repository root, the Vite framework preset, npm run build as the build command and dist as the output directory. Use npm's normal lockfile-based install. Select Node.js 24.x under Build and Deployment settings if it is not already selected; the local reviewed build uses Node 24.
4. Set the production branch to main. Before deploying, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY using the same values as the local .env. Enable them for Production and Preview. The second variable must contain a browser-safe anon/publishable key, never a service-role/secret key or database password. There is no need to paste these values into chat.
5. Deploy. Use the generated .vercel.app project address for the first checks. A hosting deployment makes the selected published data reachable at that address; holding back an announcement does not make it private.

Vercel's Vite integration and the committed rewrite handle the frontend build and deep links. [Vite setup](https://vercel.com/docs/frameworks/frontend/vite). Node 24 can be selected in project settings. [Node version guidance](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions).

Environment variables are applied to a new build; changing them requires redeployment. [Environment variables](https://vercel.com/docs/environment-variables). Vite exposes VITE-prefixed values to the browser, so database permissions remain the protection for data. [Vite environment variables](https://vite.dev/guide/env-and-mode).

## Check the hosted app

- In a signed-out/private window, browse franchises and timelines, open character/cell details, use Back/Forward, and refresh a copied deep timeline address.
- Try a private timeline address: it must be unavailable in Viewer. Origin labels can intentionally identify a private universe without opening its chronology.
- Sign into Studio as the owner; check a reversible edit using a private test timeline. Return to Viewer from Timeline, Characters and Projects. Confirm sign-out removes Studio access.
- On a real phone, check scrolling in both directions, character labels, tap details, closing popups and portrait/landscape layouts. Studio's right-click-only advanced editor still needs the separately planned touch improvement.
- Check loading/error messages and publication/unpublication using deliberate test data. Do not delete real records merely to test deployment.
- Confirm the final address loads without Vercel-account authentication when signed out. Check deployment protection settings if it does not; this is separate from Studio's owner sign-in.

Set the Supabase Auth Site URL to the final public address for future email/redirect flows, preserving appropriate localhost development redirects. Current password sign-in does not require a new redirect route. Revisit exact redirect allowlists when adding password recovery, OAuth or contributor accounts. [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Keep developing after launch

Work locally on a feature branch, push it, check the Vercel branch Preview URL, then merge into main when ready. Branches produce previews; main updates the public site. [Git deployments](https://vercel.com/docs/git).

Code cleanup, style changes and large features can all follow this flow. Editing timeline records through Studio changes Supabase data and requires no frontend deployment; other viewers see it on their next data load rather than an automatic realtime refresh.

A branch Preview using the same Supabase URL/key shares the live database. Use it for read-only browsing and carefully scoped work; use an isolated test database before testing destructive or incompatible schema changes. Keep migration SQL in version control, establish a restorable backup, make compatible additions first, update the app, and remove old fields later. Saved schema references are not backups.

Vercel rollback restores a previous frontend build, not the Supabase database. Hobby supports instant rollback to the immediately preceding production deployment; follow Vercel's instructions to resume normal production promotion afterward. [Rollback](https://vercel.com/docs/instant-rollback).

Supabase has separate usage and availability limits from Vercel. Free projects may pause after low activity over seven days; establish a backup/export plan before significant database changes. [Supabase production guidance](https://supabase.com/docs/guides/platform/going-into-prod).

## Retained work after preview

First add clear universe-card content-status badges, separate from publication/access. See the development plan for toggleable tracking guides, sorting/search/grouping, character status, richer metadata, viewer correction proposals with owner review, themes/icons, and eventual crew/cast/credits. None requires rebuilding the hosting arrangement. Contribution accounts/moderation and schema changes need their own focused design pass.
