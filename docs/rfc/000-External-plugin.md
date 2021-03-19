# External plugin API

## Principles

- It must be absolutely isolated within the Mask Network extension.
- Developers should be able to develop a working plugin without acquiring "licence" or any form of agreement from the Mask team.
- It must not harm the data or property (wallet) safety.

## General design

An external plugin should be an isolated website, which means it should not be loaded or installed onto the Mask Network.

When Mask Network detects the metadata of an external plugin, it will try to fetch the manifest and display the content in the payload. This process **must not** involve dynamic code execution.

When the user decides to interact with the external plugin, Mask Network will open a popup window and inject some APIs to it.

It is the same when user wants to use the external plugin when composing.

## User story

### Composing with external plugin

#### Discover the plugin

- If the user has used this plugin before, Mask will display it directly.

- If the user knows the plugin URL, they can manually add it.

- Users can explore plugins in a "external plugin collection", aka Masket Place.

#### Composing

After selecting the plugin, a popup window will appear.
If Mask Network has no permission to the plugin site, Mask Network will jump to a permission granting page first.

After permissions granted, the plugin page will appear.

User interacts with the plugin.

The plugin sends its payload back to the composition UI and the popup dialog closes.

### Seeing external plugin posted by others

User sees the plugin UI rendered by the Mask Network. Partial info, such as on-chain info, can be displayed directly on the card.

User clicks on the post card to interact with the plugin.

A popup window appears.
If Mask Network has no permission to the plugin site, Mask Network will jump to a permission granting page first.
After permissions granted, the plugin page will appear.

User interacts with the plugin.

## Technical details

### Plugin definition

A plugin should be deployed on a static HTTPs URL, for example <https://example.com/my-plugin>, let's call it _base url_.

It should provide a manifest file called "mask-plugin-manifest.json". For the example above, it should be located at <https://example.com/my-plugin/mask-plugin-manifest.json>. It should be in JSONC (JSON with comment) format.

The manifest file should match the following shape:

```ts
interface ExternalPluginManifestFile {
  manifest_version: 0
  name: string
  publisher: string
  description: string
  code_sign: URL
  integrity?: Record<URL, string>
  i18n?: Record<Language, URL>
  payload_preview?: Record<PayloadMetadataKey, SupportedPayloadPreviews>
}
type KnownPayloadTemplates = 'Card_1'
interface SupportedPayloadPreviews extends Record<KnownPayloadTemplates, URL> {
  prefer?: KnownPayloadTemplates
}
```

Here is an example:

```jsonc
{
  "manifest_version": 1,
  // this will look for "name" in the current i18n language
  // If you don't want to do i18n, "name": "My plugin name" is also OK
  "name": "__locales:name",
  "description": "__locales:description",
  "publisher": "__locales:publisher",
  // Sign this manifest file so people will trust me (if my GPG key is famous)!
  // If you want to sign other resources, add it to the integrity list below
  // DISCUSS: I think it's better to have users to sign by their Mask account, aka ECC key pair.
  "code_sign": "./sign.gpg",
  "integrity": {
    // I can provide hash to enforce security
    // Opt-in feature.
    "./preview/Card_1.json": "sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
    // Now with sign.gpg and this hash, we can make sure ./preview/Card_1.json is trustable
  },
  "i18n": {
    "en": "./en.json",
    "zh": "./zh.json",
    "ja": "./ja.json"
  },
  "payload_preview": {
    // In Mask it will be plugin:example.com/my-plugin:kind:1
    "kind1:1": {
      "Card_1": "./preview/Card_1.json"
    }
  }
}
```

### i18n

i18n files should follow the i18next format.

### Permissions

You might notice that there is no permission in the manifest because all permissions are designed to be requested dynamically.

### The "payload_preview" part

To avoid code execution in the Mask Network extension itself and still render a plugin UI,
we can provide some common templates allowing developers to interpolate with.

Here is an example of `./preview/Card_1.json`

```json
{
  "plugin": {
    // $ refers to the payload
    "title": "$.title",
    "description": {
      // So if the __locale:preview_description is
      // "There are still {{ balance }} in the {{ desc }}
      // It will call the contract, get the result and plug the value in
      "key": "__locale:preview_description",
      "map": {
        "desc": "$.description",
        "balance": "#.balance"
      }
    },
    "action_text": "__locale:open_to_check",
    "action_url": "./popup.html"
  },
  "vars": {
    "balance": {
      "type": "contract",
      "abi": "./my-contract.abi",
      "method": "queryDetail",
      "args": ["someVal", 0, "$.id"]
    }
  }
}
```

### API in popups

#### Mask.setMetadata(key: string, value: object)

Report the payload back to the composition.

```ts
Mask.setMetadata('kind1:1', {
  title,
  description,
  id,
})
```

#### Mask.permission.query/request/revoke

Manage permissions
