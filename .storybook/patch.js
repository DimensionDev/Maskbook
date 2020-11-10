import { WebExtensionMessage, Environment } from '@dimensiondev/holoflows-kit'

WebExtensionMessage.setup = () => {}
globalThis.__holoflows_kit_get_environment_debug__ =
    Environment.HasBrowserAPI | Environment.ExtensionProtocol | Environment.ManifestOptions
