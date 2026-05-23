# Cloudflare R2 Setup

The admin image upload flow stores images in Cloudflare R2 through the API Worker.

## Required Dashboard Step

Enable R2 in the Cloudflare account first. Wrangler currently returns:

```text
Please enable R2 through the Cloudflare Dashboard. [code: 10042]
```

After R2 is enabled, create the bucket:

```bash
npx wrangler r2 bucket create pet-app-assets
```

Then deploy the pending R2 upload build:

```bash
npx wrangler deploy
npm run deploy:admin
```

Until R2 is enabled, keep the current production deployment as-is. The local code is ready, but the production Worker cannot use the `ASSETS` binding until the bucket exists.

The Worker binding is already configured:

```toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "pet-app-assets"
```

## Upload Flow

Admin web sends multipart uploads to:

```text
POST /api/uploads/direct
```

The Worker stores the object in R2 and returns:

```text
/api/assets/<path>
```

Assets are served through the Worker, so a public R2 bucket URL or R2 custom domain is optional for now.
