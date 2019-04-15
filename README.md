# Maskbook &middot; ![GitHub license](https://img.shields.io/badge/license-AGPL-blue.svg?style=flat-square) ![Ciecle CI](https://img.shields.io/circleci/project/github/project-maskbook/Maskbook.svg?style=flat-square&logo=circleci)

[![Join the chat at https://gitter.im/Maskbook/community](https://badges.gitter.im/Maskbook/community.svg)](https://gitter.im/Maskbook/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Encrypt your posts & chats on You-Know-Where. Allow only your friends to decrypt.

For general introductions, see https://Maskbook.io/

[Install Maskbook](https://maskbook.io/install/)

## Documentation for developers

-   License: AGPL
-   Code Style: Use [prettier](https://github.com/prettier/prettier)
-   [Git flow](https://github.com/nvie/gitflow) enabled, `master` as the latest branch, `released` as the stable branch
-   UI developing: Use `yarn start` / `npm start` to start a [Storybook](https://storybook.js.org/)
-   Extension developing: Use `yarn watch` / `npm run watch` to start watch build for extension
-   Crypto: We're using [ECDH SECP256-k1](https://en.wikipedia.org/wiki/ECC) and [AES-GCM](https://en.wikipedia.org/wiki/AES)
-   Data transfer between users: We're using [gun.js](https://gun.eco)

### Prepare

After `Maskbook` and `@holoflows/kit` gets stable, we will directly add `@holoflows/kit` as a dependency. Currently, you need to install and build the latest version of `@holoflows/kit`.

#### Install dependencies

-   `yarn install`

#### Prepare for library @holoflows/kit

-   `cd ..`
-   `git clone https://github.com/project-holoflows/Holoflows-kit.git`
-   `cd Holoflows-kit`
-   `yarn install`
-   `yarn build`
-   `yarn link`
-   `cd ../Maskbook`

#### Install @holoflows/kit in Maskbook

-   `yarn link @holoflows/kit`

### Folder Structure

-   ./public - Resource file
-   ./src/components - UI Components
-   ./src/crypto - Crypto related
-   ./src/key-management - How we manage keys and user infos
-   ./src/utils - Utils
-   ./src/extension
-   -   ./background-script - Scripts that running in the background page as a service
-   -   ./content-script - Script that be injected into the web page
-   -   ./injected-script - Script that will run in the main frame of the injected web page
