# Maskbook &middot; ![GitHub license](https://img.shields.io/badge/license-AGPL-blue.svg?style=flat-square) ![Circle CI](https://img.shields.io/circleci/project/github/DimensionDev/Maskbook.svg?style=flat-square&logo=circleci) [![Join the chat at https://gitter.im/Maskbook/community](https://badges.gitter.im/Maskbook/community.svg)](https://gitter.im/Maskbook/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) ![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jkoeaghipilijlahjplgbfiocjhldnap.svg?logo=Maskbook&logoColor=%231c68f3&style=flat-square)

Encrypt your posts & chats on You-Know-Where. Allow only your friends to decrypt.

For general introductions, see https://Maskbook.com/

[Install Maskbook on Chrome Web Store](https://chrome.google.com/webstore/detail/maskbook/jkoeaghipilijlahjplgbfiocjhldnap/)

## Documentation for developers

-   License: AGPL
-   Code Style: Use [prettier](https://github.com/prettier/prettier)
-   [Git flow](https://github.com/nvie/gitflow) enabled, `master` as the latest branch, `released` as the stable branch
-   Use [Conventional Commits](https://www.conventionalcommits.org/) since 1.4.0
-   Crypto: We're using [Elliptic Curve Cryptography (ECC)](https://en.wikipedia.org/wiki/ECC) of the [SECP256-k1](https://en.bitcoin.it/wiki/Secp256k1) parameters for [secret sharing](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman) and [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) for encryption
-   Data transfer between users: We're using [gun.js](https://gun.eco)

#### Install dependencies

-   `yarn install`

#### Build and developing

-   `yarn watch` runs a watching mode. Output files in `./dist/`. Load it as unpacked Chrome or Firefox extension
-   `yarn build` build a production version. Output files in `./build/`
-   `yarn test` to run test (we didn't have one yet)
-   `yarn start` to start StoryBook. Used for UI only developing.

#### Non-famous libraries we are using

-   `@holoflows/kit` - A toolkit for extension developing
-   `anchrome` - Use it to detect links in the text
-   `construct-style-sheets-polyfill` - A polyfill for a web api
-   `elliptic` - A crypto library, we use it to encrypt and decrypt
-   `gun` - A decentralized graph databasem we use it to sync user's shared crypto key
-   `pvtsutils` and `tiny-secp256k1` - A crypto library, we use it to zip and unzip SECP256k1 keys but not using it to encrypt/decrypt
-   `serialijse` - A serialization / deserialization library
-   `webcrypto-liner` - A wrapper library, it wrap `elliptic` into WebCrypto API

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
-   ./network - How does Maskbook exchange information between users
-   ./social-network/ - Maskbook's multiple network support
-   ./social-network-provider/ - Maskbook's multiple network support
