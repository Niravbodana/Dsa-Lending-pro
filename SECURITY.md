# Security Guide — NeerCred / DSA Lending Pro

This document lists security controls built into the platform and what you must configure before going live.

## Built-in protections

| Area | Protection |
|------|------------|
| API | Security headers (HSTS on HTTPS, X-Frame-Options, nosniff) |
| API | Trusted Host middleware — blocks Host-header attacks |
| API | CORS locked to configured origins |
| API | Rate limiting on OTP, login, chat, track, KYC, bug reports |
| API | Production blocks weak `SECRET_KEY`, `ADMIN_PASSWORD`, `MOCK_OTP` |
| API | Admin sessions stored in DB with expiry (not a static token) |
| API | Webhook HMAC verification (`X-Webhook-Signature`) |
| API | Session tokens via `Authorization: Bearer` (preferred over query) |
| API | CMS image URLs restricted to approved HTTPS hosts |
| Frontend | Content-Security-Policy, frame denial, admin no-cache |
| Frontend | No default password hints on admin login page |

## Production checklist

Set these in `backend/.env` before deploying:

```env
ENV=production
SECRET_KEY=<random 32+ character string>
ADMIN_PASSWORD=<strong password, 12+ chars, not admin123>
WEBHOOK_HMAC_SECRET=<random 16+ character string>
MOCK_OTP=false
CORS_ORIGINS=https://yourdomain.com
TRUSTED_HOSTS=yourdomain.com,api.yourdomain.com
DATABASE_URL=postgresql://...
```

Also:

1. Run the API behind HTTPS (reverse proxy / load balancer).
2. Set `NEXT_PUBLIC_API_URL` to your production API URL in the frontend env.
3. Use PostgreSQL (not SQLite) for production data.
4. For multiple API instances, replace in-memory rate limiting with Redis.
5. Rotate `SECRET_KEY`, `ADMIN_PASSWORD`, and `WEBHOOK_HMAC_SECRET` if compromised.
6. Keep dependencies updated (`pip`, `npm audit`).

## Reporting vulnerabilities

If you discover a security issue, email the repository owner privately rather than opening a public issue with exploit details.
