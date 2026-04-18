# Authentication Strategy

## Chosen Approach

Use JWT authentication delivered through a secure HTTP-only cookie.

## Why This Approach

- Simpler than a database-backed session store for this MVP
- Secure enough for a single-admin content management system when paired with HTTP-only cookies
- Easy to deploy across common Node hosting platforms

## Login Flow

1. Admin submits email and password.
2. Backend validates credentials against `AdminUser`.
3. Backend signs a short-lived JWT containing minimal claims:
   - `sub`
   - `email`
   - `role`
4. Backend sets the token in an HTTP-only cookie.
5. Frontend requests `/api/v1/auth/me` to hydrate admin state.

## Cookie Rules

- `httpOnly: true`
- `sameSite: "lax"` by default
- `secure: true` in production
- short max age, such as `12h`

## Security Checklist

- Validate all login input
- Never expose whether email or password was incorrect separately
- Rotate JWT secret if compromised
- Serve API over HTTPS in production
- Restrict CORS origins
- Avoid storing token in localStorage
