# Dropship System (Minimal Stable Loop)

## Install
```bash
npm install
```

## Authentication
The job-creation endpoint is protected by a single server-side API credential.

Set the credential in the runtime environment; do not commit it to GitHub:

```text
JINXIN_API_KEY=<long-random-secret>
```

Clients may send either:

```text
X-API-Key: <secret>
```

or:

```text
Authorization: Bearer <secret>
```

The server compares the supplied credential using a timing-safe comparison. If `JINXIN_API_KEY` is missing, protected requests fail closed with HTTP 503. Invalid or missing credentials receive HTTP 401.

The repository does not implement user login, OAuth, JWT issuance, refresh tokens, or browser sessions. The API key is a service credential, not a user identity token.

## Run
```bash
npm start
```

## Create a job
```http
POST /job
Content-Type: application/json
X-API-Key: <secret>
```

```json
{
  "product": {
    "title": "Test Product",
    "description": "Example product",
    "price": "£10"
  }
}
```

A successful request returns HTTP 201 and queues the job. The worker writes the generated page to `public/products/<id>.html`.

## Request flow
1. Client sends `POST /job` with the API credential.
2. `server/auth.js` extracts `X-API-Key` or a Bearer credential.
3. The credential is compared with `JINXIN_API_KEY` without exposing the configured secret in responses.
4. Valid requests reach the job handler in `server/index.js`.
5. The job is queued in memory.
6. The worker loop processes queued jobs and writes the product HTML.

Static product pages remain publicly served by Express. Authentication protects job creation, not the generated public pages.

## Credential handling
- Secrets belong in the hosting/runtime environment, not source control.
- Never paste the production value into README, JavaScript, client-side code, or public HTML.
- Rotate the API key if it is exposed.
- The repository currently has one service credential; there is no token refresh mechanism because there is no OAuth/JWT/session system.
