---
domain: Architecture
status: Active
entry_points:
  - hugo.yaml
  - layouts/_default/baseof.html
  - content/posts
dependencies:
  - .aidoc/verification.md
  - .aidoc/deployment.md
---

# Site Architecture

The Hugo migration keeps Yuliang's published writing stable while replacing an unsupported Jekyll toolchain with a reproducible static build. Responsive templates support phones through large screens without coupling the content repository to the production host.

## Related Docs

| Document | Relationship |
|---|---|
| [Verification](verification.md) | Proves the build, links, HTML, URLs, and responsive behavior |
| [Deployment and Recovery](deployment.md) | Connects the immutable artifact to a rebuildable static host |
| [INDEX](INDEX.md) | Documentation discovery and reading chains |

## Why Hugo Exists Here

The legacy server mixed publication, runtime containers, a webhook, and a dated Ruby build. Hugo makes the artifact deterministic and allows Caddy to remain a static-file appliance with no repository checkout or build dependencies.

The migration intentionally changes presentation but not publication identity. Historical inbound links, Disqus identifiers, post dates, RSS consumers, analytics, advertising, images, and page metadata depend on stable URLs and rendered semantics.

## What the Site Contains

`content/posts/` contains the 71 migrated posts. Every post has an explicit `url` captured from the preserved production archive rather than deriving paths from filenames or timezone behavior.

`assets/images/_fullsize/` contains the single author-owned copy of each image. Posts refer to that filename with ordinary Markdown paths such as `/images/photo.jpg`. Hugo's image render hook publishes the readable source URL and generates responsive `srcset` derivatives during each build; generated filenames are an implementation detail and never enter Git or authored content.

`layouts/` contains a small custom theme instead of an external theme dependency. `static/css/main.css` uses fluid type, constrained reading width, responsive grids, overflow-safe tables and code, and reduced-motion handling.

Google Analytics, the existing responsive AdSense placement, and Disqus remain template partials with their legacy identifiers. `layouts/_markup/render-image.html` resolves authored image paths against `assets/images/_fullsize/`, emits intrinsic dimensions and responsive candidates, and preserves the source filename as a fallback URL. Authors add and commit one source image; generated derivatives belong only to the deployable artifact.

Hugo natively treats `<!--more-->` as the summary divider, so the 69 migrated manual dividers retain their established excerpts without a custom plugin. New posts may instead set an explicit front-matter `summary` when a marker inside the body would be awkward.

The static `/404.html` page retains the legacy three-second redirect to `/archive/`. `/404.html` and `/50x.html` are build invariants; the serving layer maps runtime 404 and 5xx responses to those generated pages while preserving the error status.

## Invariants

- Published post and page URLs MUST remain stable.
- Git MUST contain only author-provided image sources, not generated derivatives.
- Authored Markdown MUST refer only to readable source image filenames.
- Builds MUST happen outside the production VM and produce a self-contained `public/` artifact.
- Production MUST consume only an immutable artifact from a successful default-branch workflow.
- A candidate release MUST pass smoke validation before its activation is accepted.

## How the Site Works

`hugo.yaml` defines site metadata and renderer behavior. `layouts/index.html`, `layouts/_default/single.html`, and `layouts/archive.html` render navigation surfaces; `layouts/_default/baseof.html` owns global metadata and structure.

`content/posts/*.md` retains Markdown bodies with Jekyll image and highlight tags converted to portable Markdown or HTML. `scripts/check-site.py` compares generated files against explicit content URLs and validates internal references.
