# Setup

Hi, Welcome to the Mask Network. This guide will quickly take you through setting up the extension development environment.

## Requirements

Here is a snippet of engines requirements in the [`package.json`](../package.json) of Mask Network. As you can see, `NodeJS` and `pnpm` are required at least a specific version.

We suggest you to use the latest Node.js version, and enable [corepack](https://nodejs.org/api/corepack.html).

## Install

### pnpm

The [pnpm](https://pnpm.io/) is a disk space-efficient package manager. After NodeJS is preinstalled.

If you have [corepack](https://nodejs.org/api/corepack.html) enabled, you can skip the `pnpm` section, `pnpm` is already available!

If you want to setup pnpm manually, here is the [installation guide from pnpm](https://pnpm.io/installation).

Now, you will need to have tools installed to start development.

```bash
pnpm install
```

> If you encounter with error `EACCES: permission denied, open...'`, please run `chown -R $USER /pathToYourProject/Mask` to solve.

### Start the local development server

For Chromium-based browsers (Chrome, Opera, Edge, etc.), please run `pnpm start`. It's preset of many development commands.

If you need to develop in other environments (for example, Firefox), please run `npx dev --help` to see the documentation.

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

There is no difference between extension development and normal web development. In normal web development, you only have a single web page (SPA), but an extension could have more than one page.

There is an invisible "background page" running all the time and an "options page" like a normal web page. Moreover, an extension could inject "content script" into the currently visiting web page.

### Debug the background page

The background page of the Mask Network extension maintains a bunch of fundamental services for front-end functions. Like Crypto Algorithm, Web3 SDKs, APIs to many third-party data providers, etc. They are stand-by all the time, once to be called for a specific task.

To debug _background service_, click links right after **Inspect views**.

![An image displaying Chrome extension manage page](https://user-images.githubusercontent.com/5390719/103509131-5ce0cb00-4e9d-11eb-9aec-b24b9888b863.png)

### Debug the content script

Mask Network only injects content script with permission from the user.

For every new website that Mask Network is going to support, it will show a prompt dialog to ask permission dynamically, rather than asking for all permission when the plugin is installed.

![An image displaying the Mask Network is asking the permission from the user](https://user-images.githubusercontent.com/52657989/158566232-30c52a17-0168-488c-a292-4fc4059ecb9c.png)

To debug _content script_, open the dev tools in the web page, then you can select context as the following picture describes.

![An image displaying how to select Mask Network as the debug context](https://user-images.githubusercontent.com/5390719/103509436-1a6bbe00-4e9e-11eb-9b18-bde021337944.png)

It's important to select the correct context when you're debugging,
otherwise, you cannot access all the global variables,
_save as temp variables_ also fails.

### Use React Devtools

Run the following command to start the React Devtools. It doesn't work if you install it as a browser extension.

> pnpx react-devtools

And start the development by the following command:

> pnpx dev --profile

## Contribute your working

### Git conversions

The `develop` branch is our developing branch, and the `released` branch points to the latest released version.

Your commit message should follow [Conventional Commits](https://www.conventionalcommits.org).

### Using Git

- [Using git rebase on the command line](https://docs.github.com/en/github/getting-started-with-github/using-git-rebase-on-the-command-line)
- [Configuring a remote for a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/configuring-a-remote-for-a-fork)
- [Syncing a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests)
