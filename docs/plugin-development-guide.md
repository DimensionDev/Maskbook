# Plugin Development Guide

## Minimum File Structure

```plaintext
packages/maskbook/src/plugins/{your-plugin-name}
├── README.md        # see `README driven development`
├── index.ts         # Plugin registration
├── base.ts          # Basic definition of a plugin
├── constants.ts     # Constant definition, e.g: api end-point, etc
├── types.ts         # Provide common typing definitions
├── SNSAdaptor/index # (Optional) Provide SNSAdaptor part of the plugin
├── Dashboard/index  # (Optional) Provide Dashboard part of the plugin
├── Worker/index     # (Optional) Provide Worker part of the plugin
└── utils.ts         # Provide common utils function
```

## About `README.md` file

see [README driven development](https://tom.preston-werner.com/2010/08/23/readme-driven-development.html)

The file need to provide this information:

- Feature-set as TODOs
- Reference resource list
- Known issues / Caveats

## Using Git

- [Using git rebase on the command line](https://docs.github.com/en/github/getting-started-with-github/using-git-rebase-on-the-command-line)
- [Configuring a remote for a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/configuring-a-remote-for-a-fork)
- [Syncing a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork)

## Plugin APIs:

- Plugin definition: `packages/plugin-infra/src/types.ts`
- Database: `createPluginDatabase` in `packages/maskbook/src/database/Plugin/wrap-plugin-database.ts`
- Event emitter: `createPluginMessage` in `packages/maskbook/src/plugins/utils/createPluginMessage.ts`
- RPC: `createPluginRPC` in `packages/maskbook/src/plugins/utils/createPluginRPC.ts`
- Metadata reader: `createTypedMessageMetadataReader` in `packages/maskbook/src/protocols/typed-message/metadata.ts`
- React renderer with metadata reader: `createRenderWithMetadata` in `packages/maskbook/src/protocols/typed-message/metadata.ts`

## Architecture

The extension we talk about here is a bunch of code compiled and running in the Mask Network extension. This plugin system is for decoupling purposes. It doesn't allow load the new plugin dynamically without compiling the whole extension from the source code. If you're looking for a dynamic plugin system, you're probably looking for [External plugin](https://github.com/DimensionDev/Maskbook/pull/2621) that still in the very early stage.

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

Add a new entry in the composition dialogue, therefore, the user can interact with your plugin. When it's finished, you can insert your metadata into the post and it will be contained in the encrypted payload.
When you see metadata in the post payload, you should render some UI to reveal the information in the metadata and allow the user to interact with it.

Notice please treat the metadata you received as untrustable data, make sure you have validated the formats and the data range. We provided a utility to read the data from the post and validate it with JSON schema.

## Form guide

If you want to create a form in your plugin, please follow [Form guide](form-guide.md)
