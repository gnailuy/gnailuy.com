---
domain: Architecture
status: Active
entry_points:
  - hugo.yaml
  - layouts/_default/baseof.html
dependencies: []
---

# gnailuy.com Documentation

The site is a Hugo-built, responsive static blog that preserves the public URLs and assets of the legacy Jekyll release. This index routes maintainers to the design constraints and verification workflow.

## Related Docs

| Document | Relationship |
|---|---|
| [Site Architecture](site-architecture.md) | Generator, URL, content, and presentation decisions |
| [Verification](verification.md) | Build and black-box quality gates |
| [Deployment and Recovery](deployment.md) | Rebuild a static-serving host and connect the verified artifact to Githook |

## Reading Chains

- **Change content or templates:** Site Architecture → `hugo.yaml` → relevant `content/` or `layouts/` file → Verification.
- **Change CI or tests:** Verification → `.github/workflows/verify.yml` → `tests/site.spec.js`.
- **Build or recover production:** Site Architecture → Verification → Deployment and Recovery → `packaging/caddy/Caddyfile.example` → Githook Operations.
