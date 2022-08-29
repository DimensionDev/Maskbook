import type { PluginRuntime } from '../runtime/runtime.js'
import * as tsResults from 'ts-results'
import { Identifier, PostIdentifier, ECKeyIdentifier, ProfileIdentifier, PostIVIdentifier } from '@masknet/shared-base'
import * as typedMessage from '@masknet/typed-message'

export function addPeerDependencies(runtime: PluginRuntime) {
    runtime.addNamespaceModule('ts-results', tsResults)
    runtime.addNamespaceModule('@masknet/typed-message', typedMessage)

    runtime.addReExportModule('@masknet/base', { exportAllFrom: '@masknet/base/identifier.js' })
    runtime.addNamespaceModule('@masknet/base/identifier.js', {
        Identifier,
        PostIdentifier,
        ECKeyIdentifier,
        ProfileIdentifier,
        PostIVIdentifier,
    })

    runtime.addReExportModule('@masknet/plugin', { exportAllFrom: '@masknet/plugin/utils' })
    runtime.addReExportModule(
        '@masknet/plugin/utils',
        { exportAllFrom: '@masknet/plugin/utils/open' },
        { exportAllFrom: '@masknet/plugin/utils/rpc' },
    )
}

export function addCompatibilityModuleAlias(runtime: PluginRuntime) {
    runtime.addReExportModule('@masknet/shared-base', { exportAllFrom: '@masknet/base' })
}
