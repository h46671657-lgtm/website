# Vault (Cloudflare Pages)

File vault with tabs. R2 for blobs, KV for metadata, Pages Functions for API.

## Prereqs

    npm install -g wrangler
    wrangler login

## Create resources

    wrangler kv namespace create VAULT_META
    wrangler kv namespace create VAULT_META --preview
    wrangler r2 bucket create vault-files
    wrangler r2 bucket create vault-files-preview

Paste the two KV ids into wrangler.toml.

## Local dev

    npm install
    npm run dev

## Deploy

    npm run deploy

Or connect the repo in Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git.
Then in project Settings -> Functions -> add bindings:

    KV namespace: VAULT_META   -> <the id you created>
    R2 bucket:    VAULT_BUCKET -> vault-files
