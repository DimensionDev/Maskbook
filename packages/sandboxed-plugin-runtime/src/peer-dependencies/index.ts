import type { PluginRuntime } from '../runtime/runtime.js'
import * as tsResults from 'ts-results'
import { Identifier, PostIdentifier, ECKeyIdentifier, ProfileIdentifier, PostIVIdentifier } from '@masknet/shared-base'

export function addPeerDependencies(runtime: PluginRuntime) {
    runtime.addNamespaceModule('ts-results', tsResults)
    runtime.addReExportModule('@mask-net/base', { exportAllFrom: '@mask-net/base/identifier.js' })
    runtime.addNamespaceModule('@mask-net/base/identifier.js', {
        Identifier,
        PostIdentifier,
        ECKeyIdentifier,
        ProfileIdentifier,
        PostIVIdentifier,
    })
}

export function addCompatibilityModuleAlias(runtime: PluginRuntime) {
    runtime.addReExportModule('@masknet/shared-base', { exportAllFrom: '@mask-net/base' })
}
