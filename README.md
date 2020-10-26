<a href="https://mask.io/">
  <img src="https://dimensiondev.github.io/Maskbook-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg"
       width="200" height="200" title="([I:b])" alt="([I:b])">
</a>

# Mask Network &middot; [![GitHub license](https://img.shields.io/badge/license-AGPL-blue.svg?style=flat-square)](https://github.com/DimensionDev/Maskbook/blob/master/LICENSE) [![Circle CI](https://img.shields.io/circleci/project/github/DimensionDev/Maskbook.svg?style=flat-square&logo=circleci)](https://circleci.com/gh/DimensionDev/Maskbook) [![Join the chat at https://gitter.im/Maskbook/community](https://badges.gitter.im/Maskbook/community.svg)](https://gitter.im/Maskbook/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jkoeaghipilijlahjplgbfiocjhldnap.svg?logo=Maskbook&logoColor=%231c68f3&style=flat-square&label=Chrome%20store)][crext] [![Mozilla Add-on](https://img.shields.io/amo/v/maskbook?label=Firefox%20store&style=flat-square)][fxaddon] [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FDimensionDev%2FMaskbook.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FDimensionDev%2FMaskbook?ref=badge_shield)

Mask Network(originally named as Maskbook) is a portal to the new, open internet. With Mask Network, you can send encrypted posts to your friends, participate in cryptocurrency lucky-draws, and share encrypted files on the platforms you are already using.

For general introductions, see [Mask.io](https://mask.io/).

/_I thought what I'd do was, I'd pretend I was one of those deaf-mutes._/

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FDimensionDev%2FMaskbook.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FDimensionDev%2FMaskbook?ref=badge_large)

## Downloads

- [Maskbook on Chrome Web Store][crext]
- [Maskbook on Firefox Addon Store][fxaddon] (Works on Firefox for Android too!)
- (Beta!) [Mask Network for iOS][ios]
- (Beta!) [Mask Network for Android][android]

  [crext]: https://chrome.google.com/webstore/detail/maskbook/jkoeaghipilijlahjplgbfiocjhldnap/
  [fxaddon]: https://addons.mozilla.org/en-US/firefox/addon/maskbook/
  [ios]: https://testflight.apple.com/join/OGmGmIg1
  [android]: https://play.google.com/store/apps/details?id=com.dimension.maskbook

## Useful Links

- [User Forum](https://github.com/DimensionDev/Maskbook-Talks)
- [Report Bug](https://mask.io/links/?report-bug)
- [Twitter](https://twitter.com/ProjectMaskbook)
- [Facebook](https://www.facebook.com/realmaskbook)
- [Telegram](https://t.me/maskbook_group)
- [Discord](https://discord.gg/4SVXvj7)

## Donation

Help us by donating us:

- Bitcoin: `3PRrXj1HTXDc4j9SCQZ6hovpa74iimqtgX`
- Ethereum: `0xD71c7150962fd484a4291a193c85426Df9EaABbB`
- Gitcoin (All erc20): [Mask Network](https://gitcoin.co/grants/159/mask-networkmaskbook-the-portal-to-the-new-open-i)

## Documentation for developers

- License: GNU AGPL v3
- Code Style: Use [prettier](https://github.com/prettier/prettier)
- [Git flow](https://github.com/nvie/gitflow) enabled, `master` as the latest branch, `released` as the stable branch
- Use [Conventional Commits](https://www.conventionalcommits.org/) since 1.4.0
- Crypto: We're using [Elliptic Curve Cryptography (ECC)](https://en.wikipedia.org/wiki/ECC) of the [SECP256-k1](https://en.bitcoin.it/wiki/Secp256k1) parameters for [secret sharing](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman) and [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) for encryption
- Data transfer between users: We're using [gun.js](https://gun.eco)

### Install dependencies

- `yarn install`

#### Build and developing

- `yarn start:firefox` runs extension in a new firefox session.
- `yarn start:android` runs extension in a usb connected android device.
- `yarn start` runs extension in other browsers, manually loading required.
  [This](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) plugin may help you to reload extension quicker.
- `yarn storybook` to start StoryBook. Used for UI only developing.
- `yarn build` build a production version. Output files in `./build/`

#### HMR notice

Your browser need to allow invalid SSL certificate on https://localhost (generally port 8080) to use HMR during the development.

You can use an environment variable NO_HMR to close HMR totally.

#### Conditional compilation

- If branch name contains `full`, CI will build for all targets
- If branch name contains `ios`, CI will build for target `iOS`
- If branch name contains `android` or `gecko`, CI will build for target `firefox` `gecko`
- For any other branches, CI will build for target `base` `chromium` `firefox`

#### Other libraries we are using

- `@dimensiondev/holoflows-kit` - A toolkit for extension developing
- `anchorme` - Use it to detect links in the text
- `elliptic` - A crypto library, we use it to encrypt and decrypt
- `gun` - A decentralized graph database we use it to sync user's shared crypto key
- `pvtsutils` and `tiny-secp256k1` - A crypto library, we use it to zip and unzip SECP256k1 keys but not using it to encrypt/decrypt
- `webcrypto-liner` - A wrapper library, it wrap `elliptic` into WebCrypto API

### Folder Structure

- `./public` - Resource file
- `./src/components` - UI Components
- `./src/crypto` - Crypto related (Note, in "alpha" version, the bigger number means the older version, our first payload version is alpha-42, and the latest version in July 1 2019 is alpha-40)
- `./src/database` - How we store data.
  - `./type.ts` - Type definition for Identifier (used everywhere!)
  - `./{avatar,group,people,post}.ts` - How we store these data in database
  - `./helpers` - Helper methods for Services to use database easier
  - `./migrate` - Migrate old database to new one.
- `./src/utils` - Utils
  - `./components` - Some general React Components
  - `./hooks` - Some general React hooks
  - `./jss` - (this folder is MIT Licensed) Custom Renderer that let JSS render styles into ShadowRoot
  - `./type-transform` - Transform data types between each other
- `./src/extension`
  - `./background-script` - Scripts that running in the background page as a service
  - `./content-script` - Script that be injected into the web page
  - `./injected-script` - Script that will run in the main frame of the injected web page
- `./tests` - Some tests for Crypto algorithms
- `./stories` - Folder for StoryBook
- `./protocols` - Some standard definitions of protocols that used in Maskbook
- `./network` - How does Maskbook exchange information between users
- `./social-network/` - Maskbook's multiple network support
- `./social-network-provider/` - Maskbook's multiple network support
