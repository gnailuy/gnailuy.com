---
domain: Workflows
status: Active
entry_points:
  - .github/workflows/verify.yml
  - scripts/package_release.py
  - packaging/caddy/Caddyfile.example
dependencies:
  - .aidoc/site-architecture.md
  - .aidoc/verification.md
  - https://github.com/gnailuy/githook/blob/master/.aidoc/host-bootstrap.md
  - https://github.com/gnailuy/githook/blob/master/.aidoc/operations.md
---

# Deployment and Recovery

Production is a static-file appliance: GitHub Actions builds one immutable site artifact, Githook verifies and activates it, and Caddy serves the active release. This runbook keeps the rebuild contract in Git while leaving hostnames, filesystem paths, credentials, and provider controls outside the repository.

## Related Docs

| Document | Relationship |
|---|---|
| [Site Architecture](site-architecture.md) | Defines the content and serving invariants |
| [Verification](verification.md) | Defines the gates and artifact contract |
| [Githook Host Bootstrap](https://github.com/gnailuy/githook/blob/master/.aidoc/host-bootstrap.md) | Canonical installation and empty-host recovery procedure for Githook |
| [Githook Operations](https://github.com/gnailuy/githook/blob/master/.aidoc/operations.md) | Day-two queue, credential, replay, and component recovery procedures |
| [INDEX](INDEX.md) | Documentation discovery and reading chains |

## Why Deployment Is Split Across Repositories

The site repository owns source, build verification, release packaging, and the static-server contract. Githook owns webhook authentication, durable queueing, authoritative GitHub checks, artifact verification, immutable extraction, activation, smoke testing, and rollback. The deployment host owns only environment-specific values and credentials.

This boundary keeps the production VM free of a Git checkout, Hugo, Node.js, and build credentials. A lost host can be rebuilt from the two repositories plus replacement credentials and infrastructure settings; no unpublished application logic should exist only on the VM.

## Documentation Ownership and Reading Order

The `gnailuy.com` documentation is the entry point for the production system. This repository owns the complete host sequence, the Caddy adapter, site build and verification, and the site-specific values supplied to Githook. Read Site Architecture, Verification, and this document before rebuilding a VM.

The Githook repository owns only its reusable receiver, queue, worker, verification, activation, and rollback behavior. Follow Githook Host Bootstrap when the cross-system sequence reaches Githook installation; use Githook Operations afterward for routine maintenance. This repository references those procedures instead of copying them.

## What Must Exist Outside Git

The infrastructure provider retains the VM, network policy, DNS records, and any proxy/CDN settings. The host retains the TLS state managed by the web server, the webhook secret, and a GitHub token scoped to read Actions artifacts from this repository.

Back up or recreate those values through their owning systems. Never copy credentials, private keys, live certificates, concrete private paths, or provider account identifiers into either repository.

## Rebuild Sequence

1. Provision a supported Linux host with key-only administrative access, current security updates, host firewall policy, and public HTTP/HTTPS only where the site requires them.
2. Install Caddy from its authenticated distribution and create a non-login deployment identity. Choose a release root writable by that identity and readable—but not writable—by Caddy.
3. Install `packaging/caddy/Caddyfile.example` after supplying the public site address, active-release path, exact webhook path, and loopback Githook upstream through host-owned configuration. Validate the rendered Caddy configuration before replacing the active file.
4. Follow Githook Host Bootstrap, supplying this repository's workflow, artifact, release, smoke, and public-adapter values. That procedure owns Githook credentials, user units, webhook setup, loopback isolation, and component acceptance checks.
5. Run or re-run a successful default-branch `Verify site` workflow. Confirm that GitHub contains exactly one `site-release-<full-sha>` artifact for the run.
6. Let Githook process the completed notification, or use the recovery command documented by Githook Operations.
7. Verify the active symlink resolves inside the release root, the public health marker is `ok hugo`, representative pages and assets load, and no Githook, Caddy, or system errors appeared.
8. Restart the relevant services and perform a reboot check. Caddy and the Githook bootstrap acceptance criteria must recover without an interactive login.

## Daily Maintenance Order

1. Start here and confirm the public health marker, home page, one preserved post URL, and certificate are healthy.
2. Check the latest default-branch `Verify site` result when production is expected to have changed. Use Verification for build failures.
3. Open Githook Operations only when the active release is stale, its units are unhealthy, or queue/replay/credential work is required.
4. Use this document's Recovery Acceptance Checks after repairs that cross the site, Caddy, and Githook boundary.

## Caddy Contract

`packaging/caddy/Caddyfile.example` is a generic adapter rather than a production inventory. The installed configuration serves the configured active-release directory, maps generated error pages while preserving status codes, adds baseline response headers, and forwards only the exact webhook method and path to Githook's loopback listener.

Caddy must not receive release write permission, queue access, or either Githook credential. Githook maintenance endpoints must remain unreachable through the public virtual host.

## Release and Rollback Contract

The default-branch workflow in `.github/workflows/verify.yml` creates the only deployable artifact. `scripts/package_release.py` owns the site's archive and manifest contract; [Githook Architecture](https://github.com/gnailuy/githook/blob/master/.aidoc/architecture.md) is the canonical source for how the utility validates and activates that contract.

Every release directory is immutable after extraction. Activation replaces one `current` symlink atomically. Githook restores the previous symlink when post-activation smoke checks fail; operators should retain at least one known-good release until a newer release passes smoke, service-restart, and public-page checks.

## Recovery Acceptance Checks

- The public site redirects HTTP to HTTPS and returns a valid certificate for its configured hostname.
- `/health.txt` returns `ok hugo`; the home page, archive, one preserved post URL, and one image return successful responses.
- Caddy can read the active release but cannot write the release root.
- The Githook Host Bootstrap completion criteria pass without weakening the site/Caddy permission boundary.
- The active commit matches the successful default-branch workflow, and the previous immutable release remains available for rollback.
- A reboot restores all services and the public health check without an administrator login.
