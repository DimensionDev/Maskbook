import type { PluginRuntime } from '../runtime/runtime.js'
import * as tsResults from 'ts-results-es'
import { Identifier, PostIdentifier, ECKeyIdentifier, ProfileIdentifier, PostIVIdentifier } from '@masknet/shared-base'
import * as typedMessage from '@masknet/typed-message'

export function addPeerDependencies(runtime: PluginRuntime) {
    runtime.addNamespaceModule('ts-results-es', tsResults)
    runtime.addNamespaceModule('@masknet/typed-message', typedMessage)

    runtime.addReExportModule('@masknet/base', { exportAllFrom: '@masknet/base/identifier.js' })
    runtime.addNamespaceModule('@masknet/base/identifier.js', {
        Identifier,
        PostIdentifier,
        ECKeyIdentifier,
        ProfileIdentifier,
        PostIVIdentifier,
    })

    runtime.addReExportAllModule('@masknet/plugin', ['@masknet/plugin/utils'])
    runtime.addReExportAllModule('@masknet/plugin/utils', ['@masknet/plugin/utils/rpc'])
    runtime.addReExportAllModule('@masknet/plugin/ui', [
        //
        '@masknet/plugin/ui/showSnackbar',
        '@masknet/plugin/ui/open',
    ])
}

export function addCompatibilityModuleAlias(runtime: PluginRuntime) {
    runtime.addReExportModule('@masknet/shared-base', { exportAllFrom: '@masknet/base' })
}
