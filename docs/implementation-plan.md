# Implementation Plan

## Goal

Deliver a deployable MVP of TwentyNine Homestay Portfolio with a dynamic public site, authenticated admin dashboard, and PostgreSQL-backed API.

## Scope

- Docs package
- React frontend
- Express API
- Prisma schema
- Admin auth
- Media uploads
- CRUD for contacts, homestay images, services, and singleton sections

## Non-Goals

- Booking flows
- Payments
- Public forms
- Multi-language UI
- Complex role management

## Assumptions

- One admin account is enough
- Local disk uploads are acceptable for MVP
- Public site is a single-page experience
- The app will be deployed behind HTTPS in production

## Tasks

- [ ] Create root npm workspace configuration
- [ ] Scaffold `apps/web` with Vite, React Router, Tailwind, admin routes, and shared UI
- [ ] Scaffold `apps/api` with Express, Prisma, auth, upload handling, and route modules
- [ ] Define Prisma schema and seed data
- [ ] Build public content API and admin CRUD API
- [ ] Build public landing page from dynamic content
- [ ] Build admin dashboard and edit flows
- [ ] Add environment templates and run scripts
- [ ] Install dependencies, run validation, and fix obvious issues

## Ordering

1. Docs and architecture agreement
2. Repository and package scaffolding
3. Database schema and seed data
4. Backend core utilities and auth
5. Public and admin API endpoints
6. Frontend shell, routing, and shared components
7. Public page implementation
8. Admin forms and CRUD integration
9. Validation and cleanup

## Risks

- Dependency installation may require elevated permissions and internet access
- File uploads on local disk require care when deployed across ephemeral hosting
- JWT cookie settings must match production domain and HTTPS configuration

## Validation

- `npm.cmd install`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test` where available
- Prisma client generation and optional seed run
