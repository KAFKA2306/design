# Graphiti design promotion

Graphiti is an evidence source, not design authority. A lesson enters this repository only as a `candidate` and must identify its source repository, exact commit, evidence path, Graphiti identifier, observation time, target authority path, and the authority hash it was evaluated against.

Run `node scripts/graphiti-design-promotion.mjs <candidate.json>` before adoption. The validator fails closed when provenance is incomplete, the source fact is corrected/superseded, or current design authority no longer matches the candidate's expected authority hash.

After review/adoption, update the existing canonical token/component/interaction source itself. Do not store adopted design rules in Graphiti or create a second design registry. Downstream repositories such as agent-resources and readable-github continue to consume this repository's current registry/tokens as authority; Graphiti only supplies promotion candidates and provenance.
