# TwentyNine Homestay Portfolio

## Goal

Build a production-ready full-stack portfolio and content management system for a local guide and homestay host. The product combines a warm, travel-inspired public website with an authenticated admin dashboard and a maintainable Node.js + PostgreSQL backend.

## Current Repository State

- The repository started without application code.
- Existing files were limited to the Locole toolkit, a root `package.json`, and installed toolkit dependencies.
- There was no existing frontend, backend, database schema, or deployment structure to preserve.

## Chosen Architecture

- `apps/web`: React + TypeScript + Vite + Tailwind CSS public site and admin dashboard
- `apps/api`: Node.js + TypeScript + Express + Prisma + PostgreSQL REST API
- Root `npm` workspaces for simple dependency management
- Local media uploads stored on disk in the API app for MVP, with metadata persisted in PostgreSQL
- JWT-based admin authentication delivered via secure HTTP-only cookie

## Why This Setup

- React + Vite keeps the frontend fast and easy to maintain.
- Express is the simplest stable backend option for a small business CRUD system with uploads.
- Prisma gives a clean schema, migrations, and typed data access for PostgreSQL.
- Workspaces keep the repo organized without introducing extra monorepo tooling.
- Local upload storage keeps the MVP deployable without forcing cloud media on day one.

## Product Outcomes

- A vibrant portfolio site that presents the host, homestay, services, and contact options
- A secure admin area for managing content without editing code
- A structured backend that supports future additions such as testimonials, blogs, bookings, or multilingual content

## Scope Boundaries

Included:

- Public marketing site
- Admin authentication
- Content CRUD
- Image upload and media library
- Responsive design
- Deployment-ready environment configuration

Excluded from this MVP:

- Booking engine
- Payments
- Real-time chat
- Public user accounts
- Multi-admin permissions beyond a basic role field
