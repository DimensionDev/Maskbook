---
author: Jack-Works
maintainer:
  - Jack-Works
  - Septs
---

# Mask Network Architecture Overview

![WIP](https://img.shields.io/badge/status-wip-orange.svg?style=flat-square)

> This document describes the Mask Network protocols, the subsystems,
> the interfaces, and how it all fits together.
> It delegates non-interface details to other specs as much as possible.
> This is meant as a top-level view of the protocol and how the system fits together.

## Subsystems

### Background service

The entry point is `packages/mask/src/background-service.ts`

Background service is like a "backend" or "server" in a normal web app.
It is running on a web page that not visible to the user ([background page in Web Extensions][background-page]).
The background page hosts mosts of our non-UI-related work in the Mask Network. If you see code like

[background-page]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#background_scripts

```js
Services.Crypto.encrypt(...)
```

It is sending the request to the background service.

### Content scripts

The entry point is `packages/mask/src/content-script.ts`.

All UI on the Twitter/Facebook are rendered by the content scripts.

### Options page (or Dashboard)

The entry point is `packages/mask/src/extension/options-page/index.tsx`.

This is a normal web app that interacts with the background page.

### Injected scripts

The entry point is `packages/mask/src/extension/injected-script/index.ts`.

Generally, you don't need to modify this. It provides the ability to change the main Realm of the web page. (Thus we can emulate some DOM events).

![Architecture overview](https://user-images.githubusercontent.com/5390719/109270562-28f4a700-7849-11eb-9a7a-b364318bdeec.png)
