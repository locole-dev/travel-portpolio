# Content Model

## Overview

The content system is intentionally small and explicit. Single-instance sections are modeled as editable singletons. Repeatable groups such as contacts, services, and gallery items use CRUD tables with ordering and activation flags.

## Singleton Content

### Profile

Fields:

- `id`
- `fullName`
- `title`
- `shortIntro`
- `avatarImage`
- `heroPrimaryCtaLabel`
- `heroPrimaryCtaLink`
- `heroSecondaryCtaLabel`
- `heroSecondaryCtaLink`
- `updatedAt`

### HomestaySection

Fields:

- `id`
- `title`
- `description`
- `isActive`
- `updatedAt`

### ClosingSection

Fields:

- `id`
- `title`
- `message`
- `ctaLabel`
- `ctaLink`
- `updatedAt`

## Repeatable Content

### ContactMethod

Fields:

- `id`
- `platform`
- `label`
- `value`
- `link`
- `icon`
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

### HomestayImage

Fields:

- `id`
- `homestaySectionId`
- `imageUrl`
- `altText`
- `sortOrder`
- `createdAt`
- `updatedAt`

### ServiceItem

Fields:

- `id`
- `title`
- `description`
- `icon`
- `ctaLabel`
- `ctaLink`
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

## Admin Identity

### AdminUser

Fields:

- `id`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

## Additional Recommended Model

### MediaAsset

Purpose:

- Track uploaded image metadata for the media library
- Reuse assets across profile avatar, homestay gallery, and future content areas

Fields:

- `id`
- `fileName`
- `originalName`
- `mimeType`
- `fileSize`
- `storagePath`
- `publicUrl`
- `altText`
- `uploadedById`
- `createdAt`
- `updatedAt`

## Validation Rules

- Required URLs must be absolute URLs or valid relative upload paths
- `fullName`, `title`, and `CTA` labels should have max lengths to protect layouts
- `shortIntro` and descriptions should be trimmed
- `sortOrder` must be a non-negative integer
- Only image mime types should be accepted for upload
