---
author: Jack-Works
maintainer:
  - Jack-Works
  - Septs
---

# Caveats for developers

Hi, Welcome to the Mask Network. Here is some note for developing Mask Network.

> ! [The main Storybook in our project breaks currently](https://github.com/DimensionDev/Maskbook/issues/2187) !

Other storybook are depolyed to <https://compassionate-northcutt-326a3a.netlify.app/>

## Setup

This section is going to help you to set up the development environment of Mask Network.

### Requirements

To develop Mask Network, you need to have ...

- Node 15 or higher
- [pnpm](https://pnpm.js.org) 5+

## Development

### Install

`pnpm install`

If you encounter with error `EACCES: permission denied, open...'`, please run `chown -R $USER /pathToYourProject/Maskbook` to solve.

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
Every time you find HMR not working please open <https://localhost:8080> and ignore the HTTPs certificate error.

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

#### "WebSocket connection to 'ws://localhost:8097/' failed"

You may see continuous growing errors saying

```plain
WebSocket connection to 'ws://localhost:8097/' failed: Error in connection establishment: net::ERR_CONNECTION_REFUSED
```

If that annoys you, you can filter thoes out with `-WebSocket` in the devtools message filter.

#### Use React Devtools

React devtools is also an browser extension so unfortunately it doesn't work with Mask Network out of the box.
You need [the standalone version of React Devtools](https://github.com/facebook/react/tree/master/packages/react-devtools#:~:text=Chrome%20extension,instead)

## Contribute your working

### Git conversions

`master` branch is our developing branch, `released` branch points to the latest released version.
[Git flow](https://github.com/nvie/gitflow) is recommended but not enforced.

Please use [Conventional Commits](https://www.conventionalcommits.org) when committing.

### Git hook not working

```bash
npx husky install # on project root directory
```

### Synchronize upstream

- <https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/configuring-a-remote-for-a-fork>
- <https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork>

## Caveats for Library

- `lodash`, List of unavailable functions.
  1. `_.chain` (not friendly to tree-shake).
  2. `_.template` (see [#1865](https://github.com/DimensionDev/Maskbook/issues/1865))
