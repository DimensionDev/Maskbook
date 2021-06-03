# External plugin API

## Principles

- No dynamic code should be executed in the Mask Network extension.
- Developers should be able to develop a working plugin without acquiring "licence" or any form of agreement from the Mask team.
- It must not harm the data or property (wallet) safety.

## General design

An external plugin should be hosted on an arbitrary HTTPs URL, it should not be loaded or installed onto the Mask Network.

When Mask Network detects the metadata of an external plugin, it will try to fetch the manifest file (a JSON) and render the content in the payload.
This process **must not** involve dynamic code execution.

When the user decided to interact with the external plugin,
Mask Network will open a new popup window and inject some API to it.

It is the same when user wants to use the external plugin when composing.

## User story

### Composing with external plugin

#### Discover the plugin

- If the user has used this plugin before, Mask will display it directly.

- If the user knows the plugin URL, they can manually add it.

- Users can explore plugins in a "external plugin collection", aka Masket Place.

#### Composing

After decided the plugin to use, the user clicked on the plugin entry.
A popup window appears.
If Mask Network has no permission to the plugin site,
Mask Network will jump to a permission granting page first.

After permissions granted, the plugin page will appear.

User interacts with the plugin.

The plugin sends its payload back to the composition UI and the popup dialog closes.

### Seeing external plugin posted by others

User sees the plugin UI rendered by the Mask Network. Partial info, such as on-chain info, can be displayed directly on the card.

User clicks on the post card to interact with the plugin.

A popup window appears.
If Mask Network has no permission to the plugin site,
Mask Network will jump to a permission granting page first.
After permissions got, the plugin page will reveal.

User interacts with the plugin.

## Technical details

### Plugin definition

A plugin should be accessable on a HTTPs URL, for example <https://example.com/my-plugin/>, let's call it _base url_.

It should provide a manifest file called "mask-plugin-manifest.json".
For the example above, it should be located at <https://example.com/my-plugin/mask-plugin-manifest.json>.

The manifest file should be JSONC (JSON with comment) format.

The manifest file should match the following shape:

```typescript
interface ManifestFile {
  // version
  manifestVersion: 1
  targetSdk: 1
  minSdk?: 1

  // metadata
  name: I18NString
  publisher: I18NString
  description?: I18NString
  logo?: I18NString
  // will not be able to load in the stable build of Mask
  experimental?: boolean

  // requirements. Only one of the following can present.
  // unlisted SNS will not be able to use
  supportedSNS?: string[]
  // listed SNS will not be able to use
  unsupportedSNS?: string[]

  // security
  // TODO: sign all files mentioned in the manifest
  codeSign?: never
  integrity?: never

  permissions?: Permission[]

  // resources
  i18n?: Record<Language, URL>

  // metadata & entry
  contributions?: {
    payload?: Record<PayloadMetadataKey, PayloadDetail>
    composition?: {
      target: URL
      icon: string | URL
    }
  }
}
// Untranslated string ("App") | Translated string with fallback ("@i18n/welcome/Bonjure")
type I18NString = string | `@i18n/${string}/${string}`
type Permission = string

type PayloadDetail =
  | URL
  | {
      // points to the JSON schema to validate if it is valid
      schema: URL
      preview: URL
    }
```

Here is an example:

```jsonc
{
  "manifestVersion": 1,
  "targetSdk": 1,
  // this will look for "name" in the current i18n language
  // If you don't want to do i18n, "name": "My plugin name" is also OK
  "name": "@i18n/name/My plugin",
  "publisher": "@i18n/publisher/Jack",
  "description": "@i18n/description/This is a plugin that can ......",
  "logo": "@i18n/logo/./logo-en.svg",
  // This plugin cannot be loaded to the stable version of Mask. experimental API WILL BREAK ANY TIME!! We'd require this before external plugin has officially released.
  "experimental": true,

  "permission": ["profiles"],

  "i18n": {
    "en": "./en.json",
    "zh": "./zh.json",
    "ja": "./ja.json"
  },
  "contributions": {
    "payload": {
      // In Mask it will be plugin:example.com/my-plugin:kind:1
      "kind1:1": {
        "schema": "./kind1-v1.schema.json",
        "preview": "./kind1.html"
      }
    },
    // This allows to add a new badge in
    // the composition dialog once user added the plugin
    "composition": {
      "icon": "./badge.svg",
      // this file MUST be the same directory of the manifest file!! (Technical limit)
      "target": "./compose.html"
    }
  }
}
```

### i18n

i18n files should follow the i18next format.

### Permissions

Declare permissions here doesn't means it will be granted automatically.

All permissions are runtime permissions.

But if it does not listed here, the request will be rejected automatically.

### The "payload_preview" part

To avoid code execution in the Mask Network extension itself and still render a plugin UI,
we can provide some common templates allowing developers to interpolate with.

Here is an example of `./kind1.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <mask-card caption="From localhost!" button="Details" href="http://localhost:4242/entry?id={{payload.data.0}}">
        <i18n-translate slot="title" key="title">
          This is preview of id <span slot="id0">{{payload.data.0}}</span> and
          <span slot="id1">{{payload.data.1}}</span>
        </i18n-translate>
        Child content
      </mask-card>
    </template>
  </body>
</html>
```

### API in popups

The Mask plugin will only provide a JSON RPC based on EventTarget. The client should import a SDK file that wraps the RPC to the programmer friendly API.
