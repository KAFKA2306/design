# Graphiti design promotion

Graphiti supplies evidence, not design authority. A lesson enters this repository only as a `candidate` with source repository, exact commit, evidence path, Graphiti identifier, observation time, target authority path, and the Git blob SHA of the target authority file at observation time.

Run `node scripts/graphiti-design-promotion.mjs <candidate.json>` before adoption. Compute `expectedAuthorityHash` with `git hash-object <authority-file>` (for `registry.json#kafka-button`, hash `registry.json`). The validator reads the **current repository file** and checks that its Git blob SHA matches the candidate's expectation. It also verifies that a named registry item exists. A candidate cannot supply `currentAuthorityHash`; self-attested current state is not trusted. Missing provenance, corrected/superseded knowledge, missing authority files, and stale authority hashes fail closed.

This local validator checks provenance **format**, not the remote source commit, evidence content, or live Graphiti state. Review those independently before adoption. After adoption, update the existing canonical token/component/interaction source itself. Do not store adopted design rules in Graphiti or create a second design registry. Downstream repositories continue to consume this repository's current registry/tokens as authority.
