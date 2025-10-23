# Vercel Environment Variables

## Production Environment Variable

Add this to Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: **tokyo**
3. Go to: **Settings** → **Environment Variables**
4. Add:

```
Name: NEXT_PUBLIC_API_URL
Value: https://api.tokyokafe.uz/api
Environment: Production
```

5. Click **Save**
6. **Redeploy** your application

## Domains

- Frontend: https://tokyokafe.uz
- Backend API: https://api.tokyokafe.uz/api

## CORS Settings (Backend)

Make sure backend allows these origins:
- https://tokyokafe.uz
- https://www.tokyokafe.uz
- https://tokyo-eight-mu.vercel.app


