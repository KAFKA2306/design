# Repository instructions

`tokens/foundation.tokens.json` is the visual value authority. Generated `styles/tokens.css` must match it byte-for-byte.

Current v0 anchors are cool off-white canvas `#F6F8FB`, blue primary `#2563EB`, light-blue accent `#7DD3FC`, 30px table rows, 2px radius, and no shadow.

Do not change visual anchors because an older Issue, README, benchmark, or generated file says otherwise. A visual-anchor change requires an explicit current Issue/request that states the intended change; update token source, generated output, invariant tests, and visual regression together.

Prefer deleting or merging stale design descriptions instead of creating another authority.
