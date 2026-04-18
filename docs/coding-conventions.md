# Coding Conventions

## General

- Use TypeScript everywhere
- Prefer named exports for shared modules
- Keep files small and feature-focused
- Use English for code, types, variables, and comments

## Naming

- React components: `PascalCase`
- Hooks: `useCamelCase`
- Utility functions: `camelCase`
- Zod schemas: `somethingSchema`
- Prisma models: `PascalCase`
- API route paths: lowercase kebab-case nouns

## Frontend

- Organize by feature where possible
- Keep route files thin
- Use Tailwind utility classes with shared semantic helper components
- Prefer controlled visual primitives over large UI frameworks

## Backend

- Separate routes, controllers, services, and repositories
- Validate at the route boundary
- Throw typed application errors from services
- Keep Prisma usage out of route definitions

## Testing

- Cover critical backend flows first
- Prefer integration tests for API contracts
- Keep frontend tests targeted to higher-value components and route protection
