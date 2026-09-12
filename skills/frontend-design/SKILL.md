# Frontend design

Use only when reviewing or adopting KAFKA2306 shared Web UI in a consumer repository.

## Sources

Route to the current repository authorities:

- `AGENTS.md`
- `registry.json`
- `registry/ui/product-ui.tsx`
- `registry/ui/product/journey.ts`
- `schemas/design.config.schema.json`
- `schemas/design.lock.schema.json`
- `package.json`

## Workflow

1. Inspect the consumer's actual UI, navigation, data, actions, states, and current design ownership.
2. Map the user task to `registry/ui/product/journey.ts` and prefer existing Product UI components before consumer-local UI.
3. Adopt the selected design revision through the current config/sync path, removing obsolete consumer-local visual authority that it replaces.
4. Use `AGENTS.md` for repository-wide verification; for a rendered or deployed UI change, inspect the resulting surface.

## Scope

This skill covers Web UI adoption. Consumer business logic, data logic, and raw usage-event storage remain consumer-owned.

Do not copy token values, dependency versions, component signatures, registry inventories, or current issue status into this file.
