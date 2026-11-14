# Deployment

The site ships as a container image on GHCR and is deployed to the `vortex` host
by the fleet's Ansible deploy path. Portainer no longer owns any of this
repository's stacks.

## How a release works

1. A push to `main` (or a `v*` tag, or a manual run) starts the
   `Publish Docker image` workflow in `.github/workflows/publish-image.yml`.
2. The `build` and `build-arm64` jobs push per-architecture images by digest and
   the `merge` job publishes the multi-arch manifest. The image name is
   `ghcr.io/<owner>/<repo>`, for this repository usually
   `ghcr.io/tekkifox/vortexservers_co_uk:latest`.
3. On `main` only, the `deploy` job joins the tailnet and asks the fleet deploy
   seat to deploy:
   - the job writes the restricted `DEPLOY_SSH_KEY` and connects to the seat on
     port 32;
   - the seat's forced command runs
     `fleet-deploy vortex vortex-vortexservers-co-uk deploy`;
   - the seat validates the host and stack itself, pulls the image, recreates
     only that stack, and prints the image id.

The stack is owned by Ansible, not Portainer. It runs from
`/home/ross/stacks/vortex-vortexservers-co-uk` on the `vortex` host
(`vortex-vortexservers-co-uk` / `vortexservers.co.uk`) and was cut over to
Ansible on 2026-11-14. Configuration changes belong in the fleet Ansible
repository, not here.

## Required GitHub secrets

These repository secrets are already installed:

- `TS_AUTHKEY` - Tailscale auth key for a tagged `gh-*` node.
- `DEPLOY_SSH_KEY` - restricted SSH key whose only privilege is the deploy
  seat's forced command.
- `DEPLOY_SEAT_HOST` - address of the deploy seat. It is a secret so this public
  repository never publishes the seat's hostname.

The former `PORTAINER_URL` and `PORTAINER_API_KEY` secrets are no longer read by
any workflow and can be deleted.

## Manual deploy

Dispatch the `Publish Docker image` workflow from the Actions tab with `main`
selected: the image is rebuilt and the `deploy` job runs. A tag push or a
dispatch on any other branch publishes an image but skips the deploy, because
the job is gated on `github.ref == 'refs/heads/main'`.

From a machine already on the tailnet, with the same restricted key, the seat
can also be called directly:

```bash
ssh -i ~/.ssh/deploy -p 32 root@<deploy-seat> \
  "fleet-deploy vortex vortex-vortexservers-co-uk deploy"
```

## Stack configuration

The stack runs the published image on port `3000`, joined to the external
`proxy` Docker network, with `restart: always`. Its environment lives in the
Ansible-managed `stack.env` next to the compose file on the host:

- `IMAGE_NAME` - `ghcr.io/tekkifox/vortexservers_co_uk:latest`
- `SITE_NAME` - your public site name
- `SITE_URL` - optional canonical public origin (`https://www.vortexservers.co.uk` by default) used by `sitemap.xml` and `robots.txt`
- `PELICAN_API_BASE_URL` - Pelican client API root, usually `https://panel.example.com/api/client`
- `PELICAN_CLIENT_API_TOKEN` - Pelican client/account API token, using the full `secret_token` value from Pelican
- `NEXT_PUBLIC_PELICAN_PANEL_URL` - public panel URL used in links
- `GITHUB_REPO` - `owner/repo` path for the Decap backend
- `GITHUB_OAUTH_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_OAUTH_CLIENT_SECRET` - GitHub OAuth app client secret
- `GITHUB_CONTENT_TOKEN` - optional GitHub token used to read private CMS content at runtime

Create the GitHub OAuth app with a callback URL of
`https://your-site.example.com/callback`.

## Compose file in this repository

`docker-compose.stack.yml` mirrors the stack definition for reference. The
authoritative copy is the Ansible-managed one on the host; editing the file here
does not change the running stack. `docker-compose.yml` remains the local
development compose file with a build context.

## Registry access

If the GHCR package is private, the host must be able to pull it: log in to
`ghcr.io` on the deploy host with a token that has `read:packages`, or make the
package public. The deploy job itself never pulls the image; the seat does.
