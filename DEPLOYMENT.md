# Deployment

The site ships as a container image on GHCR and is deployed to the `vortex` host
by Ansible on that host.

## How a release works

1. A push to `main` (or a `v*` tag, or a manual run) starts the
   `Publish Docker image` workflow in `.github/workflows/publish-image.yml`.
2. The `build` and `build-arm64` jobs push per-architecture images by digest and
   the `merge` job publishes the multi-arch manifest. The image name is
   `ghcr.io/<owner>/<repo>`, for this repository usually
   `ghcr.io/tekkifox/vortexservers_co_uk:latest`.
3. On `main` only, the `deploy` job runs on the self-hosted `vortexservers`
   runner on the `vortex` host itself. It invokes the host deploy wrapper
   directly via limited sudo:

   ```bash
   sudo /usr/local/bin/vortex-deploy "vortex-vortexservers-co-uk" deploy
   ```

   The wrapper validates the stack, pulls the image, recreates only that stack,
   and prints the image id.

The stack is owned by Ansible, not Portainer. It runs from
`/home/ross/stacks/vortex-vortexservers-co-uk` on the `vortex` host
(`vortex-vortexservers-co-uk` / `vortexservers.co.uk`) and was cut over to
Ansible on 2026-11-14. The Ansible tree that owns it is `tekkifox/vortexservers_iac`,
which also provides the `vortex-deploy` command; configuration changes belong
there, not here.

## Required GitHub secrets

The deploy job runs on the self-hosted vortex runner and does not require
Tailscale or SSH deploy secrets. The former `TS_AUTHKEY`, `DEPLOY_SSH_KEY`,
`DEPLOY_SEAT_HOST`, `PORTAINER_URL`, and `PORTAINER_API_KEY` secrets are no
longer read by any workflow and can be deleted.

## Manual deploy

Dispatch the `Publish Docker image` workflow from the Actions tab with `main`
selected: the image is rebuilt and the `deploy` job runs. A tag push or a
dispatch on any other branch publishes an image but skips the deploy, because
the job is gated on `github.ref == 'refs/heads/main'`.

From the `vortex` host, the same deploy wrapper can be run directly:

```bash
sudo /usr/local/bin/vortex-deploy "vortex-vortexservers-co-uk" deploy
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
package public. The deploy job itself never pulls the image; the host deploy
wrapper does.
