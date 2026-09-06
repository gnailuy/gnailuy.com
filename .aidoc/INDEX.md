---
domain: Architecture
status: Active
entry_points:
  - hugo.yaml
  - layouts/_default/baseof.html
dependencies: []
---

# gnailuy.com Documentation

The site is a Hugo-built, responsive static blog that preserves the public URLs and assets of the legacy Jekyll release. This index is the main entry point for the complete production system; it links to Githook only where the site depends on that independently documented utility.

## Related Docs

| Document | Relationship |
|---|---|
| [Site Architecture](site-architecture.md) | Generator, URL, content, and presentation decisions |
| [Verification](verification.md) | Build and black-box quality gates |
| [Deployment and Recovery](deployment.md) | Cross-system reading order, host rebuild, daily maintenance, and the site/Githook boundary |

## Reading Chains

- **Change content or templates:** Site Architecture → `hugo.yaml` → relevant `content/` or `layouts/` file → Verification.
- **Change CI or tests:** Verification → `.github/workflows/verify.yml` → `tests/site.spec.js`.
- **Build or recover production from an empty VM:** Site Architecture → Verification → Deployment and Recovery → `packaging/caddy/Caddyfile.example` → [Githook Host Bootstrap](https://github.com/gnailuy/githook/blob/master/.aidoc/host-bootstrap.md).
- **Perform daily maintenance:** Deployment and Recovery → [Githook Operations](https://github.com/gnailuy/githook/blob/master/.aidoc/operations.md) only when queue or deployment work needs inspection.
