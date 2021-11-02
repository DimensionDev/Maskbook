---
author: Jack-Works
maintainer:
  - Jack-Works
  - Septs
---

# Plugin Development Guide

## Minimum File Structure

`packages/plugins/example/src` is an example of this structure.

```plaintext
packages/mask/src/plugins/{your-plugin-name}
├── README.md           # see `README driven development`
├── index.ts            # Plugin registration
├── base.ts             # Basic definition of a plugin
├── constants.ts        # Constant definition, e.g: api end-point, etc
├── types.ts            # Provide common typing definitions
├── SNSAdaptor/index.ts # (Optional) Provide SNSAdaptor part of the plugin
├── Dashboard/index.ts  # (Optional) Provide Dashboard part of the plugin
├── Worker/index.ts     # (Optional) Provide Worker part of the plugin
└── utils.ts            # Provide common utils function
```

## About `README.md` file

see [README driven development](https://tom.preston-werner.com/2010/08/23/readme-driven-development.html)

The file need to provide this information:

- Feature-set as TODOs
- Reference resource list
- Known issues / Caveats

## Registration

Import your plugin definition at: `packages/mask/src/plugin-infra/register.ts`.

If your plugin is defined at `packages/plugins/*` instead of `packages/mask/src/plugins/*`, please make sure you have set up the monorepo correctly.

Plugins defined at `packages/plugins/*` and compatible with the isolated dashboard should also be registered in `packages/dashboard/src/initialization/plugins.ts`

## Plugin APIs

- Plugin definition: `packages/plugin-infra/src/types.ts`
- Database: `context.getStorage()` (2nd parameter of the `init` method of your `Worker` definition). See example in `packages/plugins/example/src/Worker/index.ts`.
- Message emitter: `createPluginMessage` in `packages/plugin-infra/src/utils/message.ts`
- RPC: `createPluginRPC` in `packages/plugin-infra/src/utils/rpc.ts`
- Metadata reader: `createTypedMessageMetadataReader` in `packages/mask/src/protocols/typed-message/metadata.ts`
- React renderer with metadata reader: `createRenderWithMetadata` in `packages/mask/src/protocols/typed-message/metadata.ts`

## Architecture

The extension we talk about here is a bunch of code compiled and running in the Mask Network extension.
This plugin system is for decoupling purposes.
It doesn't allow load the new plugin dynamically without compiling the whole extension from the source code.
If you're looking for a dynamic plugin system,
you're probably looking for [External plugin][external-plugin] that still in the very early stage.

[external-plugin]: https://github.com/DimensionDev/Maskbook/pull/2621

### Plugin state

- _Registered_, the default state. The plugin has been registered in the plug-in registry.
- _Loaded_, the deferred definition of the plugin has been loaded.
- _Activated_, the plugin is activated in the current context.

State transition:

- _Registered_ => _Loaded_
- _Loaded_ => _Activated_ (enable/start the plugin)
- _Activated_ => _Loaded_ (disable the plugin)

## Metadata guide

Metadata is JSON compatible data that's can be inserted into a post.

The most common use case of the metadata is the following.

Add a new entry in the composition dialogue, therefore,
the user can interact with your plugin. When it's finished,
you can insert your metadata into the post and it will be contained in the encrypted payload.
When you see metadata in the post payload,
you should render some UI to reveal the information in the metadata and allow the user to interact with it.

Notice please treat the metadata you received as non trustable data,
make sure you have validated the formats and the data range.
We provided a utility to read the data from the post and validate it with JSON schema.

## Form guide

If you want to create a form in your plugin, please follow [Form guide](form-guide.md)
