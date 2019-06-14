# Maskbook &middot; ![GitHub license](https://img.shields.io/badge/license-AGPL-blue.svg?style=flat-square) ![Circle CI](https://img.shields.io/circleci/project/github/DimensionDev/Maskbook.svg?style=flat-square&logo=circleci) [![Join the chat at https://gitter.im/Maskbook/community](https://badges.gitter.im/Maskbook/community.svg)](https://gitter.im/Maskbook/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) ![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jkoeaghipilijlahjplgbfiocjhldnap.svg?logo=Maskbook&logoColor=%231c68f3&style=flat-square)

Encrypt your posts & chats on You-Know-Where. Allow only your friends to decrypt.

For general introductions, see https://Maskbook.com/

[Install Maskbook on Chrome Web Store](https://chrome.google.com/webstore/detail/maskbook/jkoeaghipilijlahjplgbfiocjhldnap/)

## Documentation for developers

-   License: AGPL
-   Code Style: Use [prettier](https://github.com/prettier/prettier)
-   [Git flow](https://github.com/nvie/gitflow) enabled, `master` as the latest branch, `released` as the stable branch
-   UI developing: Use `yarn start` / `npm start` to start a [Storybook](https://storybook.js.org/)
-   Extension developing: Use `yarn watch` / `npm run watch` to start watch build for extension
-   Crypto: We're using [Elliptic Curve Cryptography (ECC)](https://en.wikipedia.org/wiki/ECC) of the [SECP256-k1](https://en.bitcoin.it/wiki/Secp256k1) parameters for [secret sharing](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman) and [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) for encryption
-   Data transfer between users: We're using [gun.js](https://gun.eco)

### Prepare

After `Maskbook` and `@holoflows/kit` get stable, we will directly add `@holoflows/kit` as a dependency. Currently, you need to install and build the latest version of `@holoflows/kit`.

#### Install dependencies

-   `yarn install`

#### Prepare for library @holoflows/kit

-   `cd ..`
-   `git clone https://github.com/DimensionDev/holoflows-kit.git`
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
-   ./src/crypto - Crypto related (Note, in "alpha" version, the bigger number means the older version, our first payload version is alpha-42, and the latest version in July 1 2019 is alpha-40)
-   ./src/key-management - **OLD Database**, deprecated, in most cases you don't need them.
-   ./src/database - How we store data.
-   -   ./type.ts - Type definition for Identifier (used everywhere!)
-   -   ./{avatar,group,people,post}.ts - How we store these data in database
-   -   ./helpers - Helper methods for Services to use database easier
-   -   ./migrate - Migrate old database to new one.
-   ./src/utils - Utils
-   -   ./components - Some general React Components
-   -   ./hooks - Some general React hooks
-   -   ./jss - (this folder is MIT Licensed) Custom Renderer that let JSS render styles into ShadowRoot
-   -   ./type-transform - Transform data types between each other
-   ./src/extension
-   -   ./background-script - Scripts that running in the background page as a service
-   -   ./content-script - Script that be injected into the web page
-   -   ./injected-script - Script that will run in the main frame of the injected web page
-   ./tests - Some tests for Crypto algorithms
-   ./stories - Folder for StoryBook
-   ./protocols - Some standard definitions of protocols that used in Maskbook
-   ./network - How does Maskbook exchange informations between users
