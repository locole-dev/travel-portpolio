# Responsive Specification

## Breakpoints

- Mobile: `320px` to `639px`
- Tablet: `640px` to `1023px`
- Desktop: `1024px` to `1439px`
- Wide desktop: `1440px+`

## Global Rules

- Build mobile-first styles first
- Minimum tap target for buttons and icon actions: `44px`
- Maximum readable content width for text-heavy sections: `72ch`
- Avoid horizontal scrolling at all breakpoints
- Maintain consistent section padding with a shared container system

## Public Page Layout

### Hero

- Mobile: avatar centered above text, CTAs stacked
- Tablet: text and avatar can remain stacked with wider spacing
- Desktop: split layout with content left and avatar right
- Wide desktop: allow extra decorative shapes and increased whitespace

### Contact section

- Mobile: one-column or two-column card grid depending on width
- Tablet: two or three columns
- Desktop: multi-column layout with consistent icon alignment

### Homestay gallery

- Mobile: vertical stack or two-column mosaic
- Tablet: two to three columns
- Desktop: feature image plus supporting grid

### Services

- Mobile: one card per row
- Tablet: two cards per row
- Desktop: three or more cards depending on width

### Closing section

- Mobile: centered content with one stacked CTA
- Desktop: larger decorative framing with centered message block

## Admin Layout

- Mobile: slide-over navigation drawer
- Tablet and desktop: fixed left sidebar
- Mobile list views should collapse into stacked cards instead of wide tables
- Desktop forms can use two columns where grouping improves scanning

## Test Matrix

- `375px x 812px`
- `768px x 1024px`
- `1024px x 768px`
- `1440px x 900px`
