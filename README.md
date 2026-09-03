# design

Canonical design-system source for KAFKA2306 repositories.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Canonical visual values live in `tokens/foundation.tokens.json`. `styles/tokens.css` is generated and must not be edited directly.

Validation:

```bash
pnpm tokens:validate
pnpm tokens:check
pnpm lint
pnpm test
pnpm build
```
