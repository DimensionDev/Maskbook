---
author: Jack-Works
maintainer:
  - Jack-Works
  - Septs
---

# Caveats for developers

Hi, Welcome to the Mask Network. Here is some note for developing Mask Network.

Storybooks are depolyed to <https://compassionate-northcutt-326a3a.netlify.app/>

## Setup

This section is going to help you to set up the development environment of Mask Network.

### Requirements

To develop Mask Network, you need to have ...

- Node 15 or higher
- [pnpm](https://pnpm.js.org) 5+

## Development

### Install

```bash
pnpm install
```

If you encounter with error `EACCES: permission denied, open...'`,
please run `chown -R $USER /pathToYourProject/Mask` to solve.

### Start the development server

`pnpm start` is a preset of development command for Chromium-based browsers.

If you need to develop in other environments (for example, firefox), please run `pnpm run go`,
it is an interactive CLI tool to help you to learn out how to compose the build flags.

### Load extension into Chrome

- Open `chrome://extensions`
- Switch on "**Developer mode**"
- Click "**Load unpacked version**"
- Select
  - `project_root/dist` folder (in **development mode**)
  - `project_root/build` folder (after a **production mode** build).

### Load extension into Firefox

- Open `about:debugging#/runtime/this-firefox`
- Click "**Load Temporary Add-on**"
- Select any file in the `dist` folder

### Hot Module Reload

This project supports Hot Module Reload which fasten the development process.

To disable HMR, set an environment variable `NO_HMR` to _true_.

### Debug tricks for Chromium-based devtools

#### Debug Background Service

To debug _background service_, click links right after **Inspect views**

![An image displaying Chrome extension manage page](https://user-images.githubusercontent.com/5390719/103509131-5ce0cb00-4e9d-11eb-9aec-b24b9888b863.png)

#### Debug Content Script

To debug _content script_, open the devtools in the web page,
then you can select context as the following picture describes.

![An image displaying how to select Mask Network as the debug context](https://user-images.githubusercontent.com/5390719/103509436-1a6bbe00-4e9e-11eb-9b18-bde021337944.png)

It's important to select the correct context when you're debugging,
otherwise you cannot access all the global variables,
_save as temp variables_ also fails.

#### Use React Devtools

Run the following command to start the React Devtools. It doesn't work if you install it as a browser extension.

> pnpx react-devtools

Due to bug <https://github.com/facebook/react/issues/20377>, React Devtools is conflict with React Fast Refresh.

Please use the following command, it will start the development process in profile mode, which disables React Fast Refresh and enables React Devtools.

> pnpx dev profile

## Contribute your working

### Git conversions

`master` branch is our developing branch, `released` branch points to the latest released version.
[Git flow](https://github.com/nvie/gitflow) is recommended but not enforced.

Please use [Conventional Commits](https://www.conventionalcommits.org) when committing.

### Git hook not working

```bash
npx husky install # on project root directory
```

### Using Git

- [Using git rebase on the command line](https://docs.github.com/en/github/getting-started-with-github/using-git-rebase-on-the-command-line)
- [Configuring a remote for a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/configuring-a-remote-for-a-fork)
- [Syncing a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork)

## Caveats for Library

- `lodash`, List of unavailable functions.
  1. `_.chain` (not friendly to tree-shake).
  2. `_.template` (see [#1865](https://github.com/DimensionDev/Maskbook/issues/1865))
- `crypto`, the Node.js built-in library cannot be used in the project. Please use Web Crypto API instead.

## How to resolve merge conflicts in `pnpm-lock.yaml`?

Do not try to pick either side of the lockfile.

Drop both "ours" and "theirs" version (then the file will be in the base version).

Then run `pnpm install` to up the lockfile to date.
