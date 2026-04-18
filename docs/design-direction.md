# Design Direction

## Brand Feel

The public site should feel warm, colorful, friendly, and personal. It should look like a confident local host sharing a welcoming place to stay and easy ways to explore the destination, not like a corporate hospitality brand.

## Design System Direction

Based on the local `ui-ux-pro-max` workflow, the selected design direction is:

- Pattern: Storytelling-Driven
- Style: Motion-Driven
- Hero CTA placement: Above the fold
- Structure: Hero > Features > CTA

## Color Palette

- Cream base: `#FFF8F1`
- Blush lavender: `#E9D5FF`
- Sky blue: `#BAE6FD`
- Sunny orange: `#FDBA74`
- Fresh green: `#86EFAC`
- Pink accent: `#EC4899`
- Cyan CTA accent: `#06B6D4`
- Deep text: `#6B214D`

## Typography

- Heading: `Caveat`
- Body: `Quicksand`

Usage:

- Use `Caveat` for hero name and welcome accents.
- Use `Quicksand` for body text, buttons, forms, and admin UI.

## Hero Direction

### Desktop

- Two-column layout
- Text content on the left
- Large circular avatar on the right with overlapping gradient halo shapes
- Floating accent cards for trust cues such as homestay, local guide, and airport pickup

### Mobile

- Avatar first
- Name and title centered below
- CTA buttons stacked with comfortable touch targets
- Background shapes simplified to preserve readability

## Motion

- Section reveal animations on scroll
- Gentle hover transitions on cards and buttons
- Decorative background motion limited to subtle drifting
- Respect `prefers-reduced-motion` by disabling transform-heavy effects

## Anti-Patterns To Avoid

- Generic SaaS dashboard styling on the public site
- Purple-on-white defaults with no warmth
- Overly transparent panels that hurt readability
- Heavy parallax or animation that distracts on mobile
- Corporate stock-photo feel
