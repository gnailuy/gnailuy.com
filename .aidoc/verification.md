---
domain: Workflows
status: Active
entry_points:
  - .github/workflows/verify.yml
  - scripts/check-site.py
  - scripts/package_release.py
  - tests/site.spec.js
dependencies:
  - .aidoc/site-architecture.md
---

# Verification

Verification treats the generated site as a user-visible artifact rather than trusting template compilation alone. CI checks deterministic construction, expected URLs, internal links, HTML structure, and responsive browser behavior before a release can be reviewed.

## Related Docs

| Document | Relationship |
|---|---|
| [Site Architecture](site-architecture.md) | Defines the invariants the checks protect |
| [INDEX](INDEX.md) | Documentation discovery and reading chains |

## Why Verification Is Layered

A successful Hugo command does not prove that migrated URLs exist, images resolve, markup is usable, or mobile navigation works. The layered gates keep failures attributable: Hugo owns generation, the Python checker owns artifact integrity, html-validate owns markup quality, and Playwright owns black-box rendering.

External links are not a blocking gate because many historical posts intentionally reference old third-party resources. Internal links are blocking because this repository controls their targets.

## What CI Verifies

`hugo --minify --gc` builds the artifact with the pinned Extended release. `scripts/check-site.py` verifies all explicit post URLs, required pages, local `href`, `src`, and `srcset` targets, and the one-to-one relationship between authored Markdown image names and source-only image ownership.

`html-validate` checks every generated HTML file. The configuration relaxes presentational rules that conflict with historical article HTML while retaining document, nesting, attribute, and accessibility-oriented checks.

`tests/site.spec.js` loads the built artifact at desktop and mobile viewports, checks primary navigation, verifies representative articles and generated error pages, proves authored image names produce responsive Hugo derivatives rather than legacy filenames, proves the legacy 404-to-archive redirect, and rejects horizontal page overflow. Playwright saves screenshots for inspection.

The representative article check asserts that the configured Google Analytics and Disqus integration points are present without depending on successful third-party network responses. It also verifies that disabling `params.adsEnabled` removes the AdSense container and provider script. A math-enabled article proves that MathJax renders both inline and display LaTeX.

## How to Run the Gates

Run `hugo --minify --gc`, then `npm test`. For browser-only iteration, run `npm run test:browser`; Playwright starts a local server from `public/`.

CI uploads browser screenshots even when a scenario fails. A release reviewer should inspect both desktop and mobile captures before staging the artifact.

## What the Default-Branch Artifact Contains

Pull-request runs stop after verification and never publish a deployable artifact. A successful push to `master` runs `package_release.build_bundle` against the already-tested `public/` directory and uploads exactly one `site-release-<full-sha>` artifact.

The release ZIP contains one deterministic `gnailuy.com-<full-sha>.tar.gz`, its SHA-256 checksum, and `manifest.json` binding the archive to the repository, workflow run, and head commit. Githook independently verifies those values before extraction or activation.
