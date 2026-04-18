# Product Requirements

## Product Summary

TwentyNine Homestay Portfolio is a content-managed website for a local guide and homestay host. The product must feel personal and trustworthy while giving the owner full control over website content from an admin dashboard.

## Target Users

### Primary visitor

- Travelers looking for a local guide, airport support, transportation help, or a friendly homestay
- Mobile-first users arriving from social media or messaging apps

### Primary admin

- The homestay owner or assistant managing website content without editing source code

## Functional Requirements

### Public website

- Render all public content from backend APIs
- Show only active or visible content
- Display profile hero with avatar, title, intro, and CTA buttons
- Render contact methods with platform-specific labels and links
- Present homestay section with gallery images
- Present services and transportation offerings
- Present closing thank-you section with final CTA

### Admin dashboard

- Require authentication before access
- Provide overview cards and shortcuts on a dashboard landing page
- Allow editing of singleton content areas such as profile, homestay intro, and closing section
- Allow CRUD for repeatable content such as contacts, services, and media
- Allow image uploads and media assignment
- Allow visibility toggles and manual sort ordering where relevant
- Surface success, loading, empty, and error states clearly

### Backend API

- Expose public read endpoints
- Expose admin CRUD endpoints
- Validate request bodies, params, and query strings
- Persist content in PostgreSQL
- Handle uploads safely
- Enforce admin authentication and route protection
- Return consistent JSON responses

## Non-Functional Requirements

- Mobile-first responsive behavior
- Good perceived performance on low-end phones
- Accessible color contrast and keyboard navigation in admin
- Clean content model that avoids hard-coded website copy
- Straightforward deployment to a single VM, Render, Railway, or similar platform
- Maintainable folder structure and naming conventions

## Business Rules

- The public website must never expose inactive contacts or inactive services.
- Admin-only endpoints must require a valid auth cookie.
- Media uploads must be limited to image file types.
- Sort order must control display order for contacts, services, and homestay images.
- Single-instance sections should be editable as singletons rather than repeatable collections.

## Assumptions

- One main admin user is enough for MVP.
- English content is the default seed language.
- The website does not need user-submitted forms in the initial release because the preferred conversion path is messaging platforms and CTA links.
