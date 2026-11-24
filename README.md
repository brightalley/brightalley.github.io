# Bright Alley - Status page
This project is used as an independent communication channel in case of a calamity. It can be used to provide customers or employees with information and updates when other communication channels are unavailable.

This project is hosted using GitHub pages and runs under the domain: [status.brightalley.nl](https://status.brightalley.nl). It is completely independent of our regular hosting provider infrastructure so it is likely to be still functional when our main hosting infrastructure should be down.

## Installation
1. `git clone https://github.com/brightalley/brightalley.github.io.git ./`

2. `npm install`

3. `npm run dev`

## Deployment
There is an automatic GitHub Actions deployment pipeline. Commits pushed to the main branch are automatically deployed to GitHub Pages.

## Updating the status
The status shown on the homepage lives in [`content/status.md`](content/status.md). It is rendered into `index.html` at build time, so the published page is plain HTML. The file has two sections:

- **Actuele status** – ongoing incidents (or the green "all systems operational" notice).
- **Historie** – resolved incidents, newest first, including start and resolution dates.

Guidelines and a template incident are included as comments at the top of the file.

### Via the admin page
Go to [status.brightalley.nl/admin/](https://status.brightalley.nl/admin/) and log in with a GitHub **fine-grained personal access token**:

1. GitHub → Settings → Developer settings → Fine-grained tokens → *Generate new token*.
2. Resource owner: `brightalley`, repository access: only `brightalley.github.io`.
3. Permissions: **Contents: Read and write**.

The admin page checks that the token has write access, shows a live preview of your changes, and commits them to `main`. That triggers the deployment, and the page is updated within about 1–2 minutes. The token is stored in session storage only.

> The admin page itself is public static HTML. Access is enforced by GitHub: without a token that has write access to this repository, nothing can be read or changed.

### Via Git
Edit `content/status.md` and push to `main`.
There is an automatic GitHub Actions deployment pipeline. Commits pushed to the main branch are automatically deployed to GitHub Pages..
