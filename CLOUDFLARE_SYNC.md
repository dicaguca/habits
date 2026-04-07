# Cloudflare Sync Setup

This app syncs to your existing shared Cloudflare Worker API and KV storage.

## Existing Cloudflare API

- Worker/API URL: `https://api.sadhanas.app`
- App data key used by this app: `habits`
- Full sync URL used by the app: `https://api.sadhanas.app/habits`
- Worker KV binding from your code: `SADHANAS_STORAGE`

## What the sync stores

The cloud payload includes:

- `dailyLogs`
- `pbLogs`
- `weeklyGoals`
- `updatedAt`

The browser still keeps localStorage as a local backup.

## Important CORS note

Your Worker currently allows `https://habits.sadhanas.app`, so the deployed app should be able to sync.

If you want to test Cloudflare sync while running Vite locally, add this origin to the Worker `ALLOWED_ORIGINS` list:

```js
'http://localhost:5173'
```

Without that, local browser testing may show a CORS error, but the deployed `https://habits.sadhanas.app` version should be fine.

