# Bounty Development Guide

Hi, Awesome people! Welcome to start a bounty task on Mask Network.

## Tech Reqirements

Mask Network extension is written in TypeScript. The UI is written by React and [@mui](https://mui.com/) framework. We write CSS in [CSS-in-JS](css-in-js.md) style.

We prefer widely adopting tech solutions that include:

- [Web3.js](https://web3js.readthedocs.io/) Ethereum JavaScript API
- [react-use](https://streamich.github.io/react-use/) React Hooks — 👍
- [bignumber.js](https://mikemcl.github.io/bignumber.js/) A JavaScript library for arbitrary-precision arithmetic.
- [lodash](https://lodash.com/docs/) A modern JavaScript utility library delivering modularity, performance & extras.
- [urlcat](https://urlcat.dev/) A URL builder library for JavaScript.

> If your bounty task is related to another project, it could have extra requirements that need to consider.

If you are familiar with these libraries mentioned above, it will take less effort for you to get started.
The codebase is open-sourced under the AGPLv3 license.

## General Content

After cloning the repository and [set up the development environment](setup.md). The codebase is constructed as a monorepo with many internal packages. Each package serves a specific purpose. Let's take a quick tour.

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

- `packages/web3-constants` Each Web3 constant must set up for all kowned chain IDs.
- `packages/web3-contracts` EVM contract ABIs and compiled TypeScript definitions.
- `packages/web3-provider` A hub of APIs for external data source.
- `packages/web3-shared-*` Shared hooks, utilities, types for each network.

## Plugin

If you want's add plugin, then MUST read this file [Plugin Development Guide](plugin-development-guide.md)

## Internationalization (i18n)

If you want's update locale, then MUST read this file [i18n Guide](i18n-guide.md)
