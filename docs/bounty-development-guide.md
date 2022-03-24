# Bounty Development Guide

Hi, Awesome people! Welcome to start a bounty task on Mask Network.

## Tech Reqirements

Mask Network extension is mainly written in TypeScript. The UI part is building with React upon [MUI](https://mui.com/getting-started/installation/) framework. Also, we write [CSS-in-JS](css-in-js.md). Use webpack to build the project. Besides that, we prefer widely adopting tech solutions that includes:

- [Web3.js](https://web3js.readthedocs.io/) Ethereum JavaScript API
- [react-use](https://streamich.github.io/react-use/) React Hooks — 👍
- [bignumber.js](https://mikemcl.github.io/bignumber.js/) A JavaScript library for arbitrary-precision arithmetic.
- [lodash](https://lodash.com/docs/) A modern JavaScript utility library delivering modularity, performance & extras.
- [urlcat](https://urlcat.dev/) A URL builder library for JavaScript.

> If your bounty task is related to another project, it could have extra requirements that need to consider.

The codebase is totally open sourced. Anyone can review it. If you are familiar with these libraries mentioned above, it will take less friction for you to get start.

## General Content

Firstly, you can clone the repository and [set up the development environment](setup.md). The codebase is easy to understand, although with a huge size. It divides into many packages. Each package serves a specific purpose, as its name says. Let's take a quick tour.

### Core Packages

- `packages/mask` The main extension which has multiple websites supports, keeps the user's data safe and hosts a plugin system.
- `packages/encryption` The encryption & decryption of mask network.
- `packages/plugin-infra` The definition of the plugin system, with a bunch of APIs to expose the core abilities to plugins.

### Plugin Packages

- `packages/plugins/*` All of integrated plugins.

### Shared Packages

- `packages/shared` Shared UI components and utilities.
- `packages/shared-base` Shared types, constants, and atomic units. Must be as pure as possible and testable.

### Web3 Related Packages

- `packages/web3-constants` Constants

## Plugin

If you want's add plugin, then MUST read this file [Plugin Development Guide](plugin-development-guide.md)

## Internationalization (i18n)

If you want's update locale, then MUST read this file [i18n Guide](i18n-guide.md)
