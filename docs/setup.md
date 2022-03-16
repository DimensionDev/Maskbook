# Setup

Hi, Welcome to the Mask Network. This guide will quickly take you through setting up the extension development environment.

## Requirements

Here is a snippet of engines requirements in the `package.json` of Mask Network. As you see, `NodeJS` and `pnpm` are required at least a specific version.

```json
"engines": {
    "node": ">=16.0.0",
    "pnpm": ">=6.32.1",
  }
```

## Install

### NodeJS

Please install NodeJS from the official document [here](https://nodejs.org/en/). Or install it from a Node version manager, e.g., [nvm](https://github.com/nvm-sh/nvm).

### pnpm

The [pnpm](https://pnpm.io/) is a disk space-efficient package manager. After NodeJS is preinstalled. You could easily get pnpm from

```bash
npm install -g pnpm
```

Now, you will need to have packages installed to start development.

```bash
pnpm install
```

> If you encounter with error `EACCES: permission denied, open...'`, please run `chown -R $USER /pathToYourProject/Mask` to solve.

### Start the local development server

For Chromium-based browsers (Chrome, Opera, Edge, etc.), please run `pnpm start`. It's preset of many development commands.

If you need to develop in other environments (for example, Firefox), please run `pnpm run go`. It is an interactive CLI tool to help you learn how to compose the build flags.

### Load the extension into your browser

Mask Network has a huge codebase, and it might take time to let the webpack fully startup. It outcomes the `disk/` folder, which contains the unpacked source files of a development version of the Mask Network extension.

For Chrome,

- Open `chrome://extensions` or `Settings -> Extensions`.
- Turn on the `Developer mode` on the top right corner.
- It will present a top toolbar with an action button `Load unpacked` on it. Click it and choose the `dist/` folder to load the unpacked version of the Mask Network extension. You can drag and drop the `dist` folder into this page.
- If everything goes fine. Then, the Mask Network will guide you to the setup process.

For Firefox, it's quite the same process.

- Open `about:debugging#/runtime/this-firefox`
- Click the `Load Temporary Add-on…` and select the `dist/` folder to load the unpacked extension.
- If everything goes fine. The Mask Network will start to guide you to the setup process.

## Debugging

There is no difference between extension development and normal web development. As normal web development, only one front-end page to have, but an extension could have more than one page simultaneously. A background page without a user interface running all the time and an options page just like a normal web page with which users can interact. Moreover, an extension could inject content script into the currently visiting page with the allowance from the users.

### Debug the background page

The background page of the Mask Network extension maintains a bunch of fundamental services for front-end functions. Like Crypto Algorithm, Web3 SDKs, APIs to many third-party data providers, etc. They are stand-by all the time, once to be called for a specific task.

To debug _background service_, click links right after **Inspect views**

![An image displaying Chrome extension manage page](https://user-images.githubusercontent.com/5390719/103509131-5ce0cb00-4e9d-11eb-9aec-b24b9888b863.png)

### Debug the content script

Mask Network only injects content script with permission from the user.

For every new website that Mask Network is going to support, it will show a prompt dialog to ask permission dynamically, rather than asking for all mightly permission at the plugin got installed.

To debug _content script_, open the dev tools in the web page,
then you can select context as the following picture describes.

![An image displaying how to select Mask Network as the debug context](https://user-images.githubusercontent.com/5390719/103509436-1a6bbe00-4e9e-11eb-9b18-bde021337944.png)

It's important to select the correct context when you're debugging,
otherwise, you cannot access all the global variables,
_save as temp variables_ also fails.

### Use React Devtools

Run the following command to start the React Devtools. It doesn't work if you install it as a browser extension.

> pnpx react-devtools

Due to bug <https://github.com/facebook/react/issues/20377>, React Devtools conflicts with React Fast Refresh.

Please use the following command, and it will start the development process in profile mode, which disables React Fast Refresh and enables React Devtools.

> pnpx dev profile

## Contribute your working

### Git conversions

The `develop` branch is our developing branch, and the `released` branch points to the latest released version.
[Git flow](https://github.com/nvie/gitflow) is recommended but not enforced.

Please use [Conventional Commits](https://www.conventionalcommits.org) when do committing.

### Using Git

- [Using git rebase on the command line](https://docs.github.com/en/github/getting-started-with-github/using-git-rebase-on-the-command-line)
- [Configuring a remote for a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/configuring-a-remote-for-a-fork)
- [Syncing a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests)
