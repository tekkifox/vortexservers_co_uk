# Portainer Setup

Use the GHCR image published by the GitHub Actions workflow, then point Portainer at the `docker-compose.portainer.yml` stack file.

## 1. Connect the repository to GitHub Actions

The workflow in `.github/workflows/publish-image.yml` publishes the container image to GitHub Container Registry on:

- pushes to `main`
- version tags like `v1.0.0`
- manual runs from the Actions tab

The image name is:

`ghcr.io/<owner>/<repo>`

For this repository it will usually be:

`ghcr.io/<your-github-username>/vortexservers_co_uk:latest`

After the image is published, the `Trigger Portainer webhook` workflow can call your Portainer stack webhook automatically when `main` completes successfully.

## 2. Create the Portainer stack

In Portainer:

1. Open **Stacks**.
2. Select **Add stack**.
3. Choose **Repository** if you want Portainer to pull the compose file from GitHub, or **Web editor** if you want to paste the stack manually.
4. If you use **Repository**, set the Git repository URL to `https://github.com/<owner>/<repo>.git` and the compose path to `docker-compose.portainer.yml`.
5. Set the environment variables for the stack.

## 3. Set stack environment variables

Required variables:

- `IMAGE_NAME` - `ghcr.io/<owner>/<repo>:latest`
- `SITE_NAME` - your public site name
- `PELICAN_API_BASE_URL` - Pelican client API root, usually `https://panel.example.com/api/client`
- `PELICAN_CLIENT_API_TOKEN` - Pelican client/account API token, using the full `secret_token` value from Pelican
- `NEXT_PUBLIC_PELICAN_PANEL_URL` - public panel URL used in links
- `GITHUB_REPO` - `owner/repo` path for the Decap backend
- `GITHUB_OAUTH_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_OAUTH_CLIENT_SECRET` - GitHub OAuth app client secret
- `GITHUB_CONTENT_TOKEN` - optional GitHub token used to read private CMS content at runtime

Create the GitHub OAuth app with a callback URL of `https://your-site.example.com/callback`.

If the repo is private, add the GitHub credentials Portainer needs to read the repository before deploying the stack.

## 4. Add the GitHub webhook secret

Create a repository secret in GitHub named `PORTAINER_WEBHOOK_URL` and set it to the Portainer stack webhook URL.

In Portainer, open the stack and create or copy the stack webhook URL from the webhook action. The workflow will send a `POST` request to that URL after the image publish workflow succeeds on `main`.

## 5. Deploy

After the stack is created, Portainer will pull the image and start the service on port `3000`.

## 6. If the registry is private

If the GitHub Container Registry package is private:

1. Add a registry in Portainer for `ghcr.io`.
2. Use a GitHub token with `read:packages` permission.
3. Attach that registry to the stack before deploying.

## Local file option

If you want Portainer to build directly from the repo instead of pulling GHCR, keep using `docker-compose.yml`. That file includes a build context for local development, while `docker-compose.portainer.yml` is the image-based deployment variant.
