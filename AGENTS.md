# Repository instructions

`tokens/foundation.tokens.json` is the visual value authority. Generated `styles/tokens.css` must match it byte-for-byte.

Current user-approved v0 anchors are warm off-white canvas `#F7F5EF`, dark-navy foreground `#17233F`, blue primary `#2563EB`, light-blue accent `#7DD3FC`, 30px table rows, and no shadow.

Do not change visual anchors because an older Issue, README, benchmark, or generated file says otherwise. A visual-anchor change requires an explicit current user request; update token source, generated output, invariant tests, dependent registry aliases, and visual regression together.

Prefer deleting or merging stale design descriptions instead of creating another authority.
