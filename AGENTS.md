# Repository authority

- `main` is the only long-lived authority.
- Current explicit user direction overrides stale issue prose or old branches.
- `tokens/foundation.tokens.json` is the only hand-edited visual-token authority; generated styles must be regenerated, not hand-edited.
- `artifacts/content.schema.json` is the only cross-format semantic/content authority. UI components may render its fields but must not create a competing verification or provenance model.
- Registry component source lives once under `registry/ui/`; consumer copies are generated/installed artifacts.
- Product charts use the centrally configured Recharts adapter in `registry/ui/product-ui.tsx`; consumers must not redefine palette, grid, line geometry, actual/forecast styling, tooltip, or chart spacing.
- Do not commit employer, customer, internal-project, or other confidential names, values, sources, masters, images, screenshots, summaries, or derived information. Repository fixtures must be synthetic/test-only.
- Fail loudly rather than silently falling back when canonical input is missing or malformed.
- One active work item uses at most one branch. Merge/closed PR branches are disposable; do not use stale branches as authority.
