# Frontend design

Use this skill for Web UI review and adoption in KAFKA2306 consumer repositories.

## Sources

Use the current repository authorities directly:

- `registry.json`
- `registry/ui/product-ui.tsx`
- `registry/ui/product/journey.ts`
- `schemas/design.config.schema.json`
- `schemas/design.lock.schema.json`
- `package.json`

## Workflow

1. Inspect the consumer's actual UI, navigation, data, actions, states, and current design ownership.
2. Express the user task with the journey actions implemented in `registry/ui/product/journey.ts`.
3. Prefer existing Product UI components and shared primitives before consumer-local UI.
4. Remove obsolete consumer-local visual authority when adopting the shared design system.
5. Adopt the selected design revision through the current config and sync path.
6. Verify the resulting consumer surface and the relevant repository conformance.

## Scope

This skill covers Web UI. Consumer business logic, data logic, and raw usage-event storage remain consumer-owned.

Do not copy token values, dependency versions, component signatures, registry inventories, or current issue status into this file.
