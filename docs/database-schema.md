# Database Schema

## Database Choice

- PostgreSQL
- Prisma ORM
- UUID primary keys for public-facing records and easier future distribution

## Models

- `Profile`
- `ContactMethod`
- `HomestaySection`
- `HomestayImage`
- `ServiceItem`
- `ClosingSection`
- `AdminUser`
- `MediaAsset`

## Relationships

- `HomestaySection` one-to-many `HomestayImage`
- `AdminUser` one-to-many `MediaAsset`

## Index Strategy

- Unique index on `AdminUser.email`
- Index on `ContactMethod.sortOrder`
- Index on `ServiceItem.sortOrder`
- Index on `HomestayImage.sortOrder`
- Foreign key index on `HomestayImage.homestaySectionId`
- Foreign key index on `MediaAsset.uploadedById`

## Migration Strategy

- Start with initial baseline migration
- Use additive migrations for future content models
- Avoid destructive schema changes in one step
- Backfill before enforcing new `NOT NULL` constraints on production data

## Seed Data Plan

- Seed one `Profile`
- Seed one `HomestaySection`
- Seed one `ClosingSection`
- Seed one admin user using env-provided credentials
- Seed starter contacts for major platforms
- Seed starter service items
