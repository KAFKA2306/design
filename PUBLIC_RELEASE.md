# Public release boundary

This repository is a public design-system authority. It must contain reusable design source, schemas, tests, workflows, and explicitly synthetic fixtures only.

Do not commit employer, customer, or private-project names or data; personal data; credentials; API keys; access tokens; private keys; internal hostnames; private URLs; raw telemetry; or proprietary business/data logic.

Synthetic fixtures must say that they are synthetic and must not be presented as production evidence.

The `Public safety` workflow scans full reachable Git history for secrets. A failed scan blocks publication and deployment work; findings must be removed from history or otherwise resolved before release.
