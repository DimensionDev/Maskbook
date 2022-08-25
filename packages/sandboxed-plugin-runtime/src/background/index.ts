import { PluginRuntime } from '../runtime/runtime.js'
import { getURL } from '../utils/url.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { serializer } from '@masknet/shared-base'
import { isManifest } from '../utils/manifest.js'
import type { ExportAllBinding } from '@masknet/compartment'

export async function startBackgroundHost(signal: AbortSignal, includeLocals = false) {
    // TODO: support HMR for plugin list update.
    const plugins = await fetch('/sandboxed-modules/plugins.json').then((x) => x.json())

    for (const [id, states] of Object.entries(plugins) as Iterable<[string, { formal?: boolean; local?: boolean }]>) {
        if (states.local) {
            if (includeLocals) {
                loadPlugin(id, true, signal)
            }
            // TODO: setup a module & fetch alias from formal version to local version
        } else if (states.formal) {
            loadPlugin(id, false, signal)
        } else {
            throw new TypeError('Invalid plugin manifest.')
        }
    }
}

async function loadPlugin(id: string, isLocal: boolean, signal: AbortSignal) {
    const manifest = await fetchManifest(id, isLocal)

    const runtime = new PluginRuntime(id, {}, signal)
    addPeerDependencies(runtime)
    // TODO: provide impl for @masknet/plugin/utils/open (openWindow)
    // TODO: provide impl for @masknet/plugin/worker (taggedStorage, addBackupHandler)

    const { background, rpc, rpcGenerator } = manifest.entries || {}
    if (background) await runtime.imports(getURL(id, background, isLocal))

    if (rpc || rpcGenerator) {
        const channel = new WebExtensionMessage<{ f: any; g: any }>({ domain: `mask-plugin-${id}-rpc` })

        const rpcReExports: ExportAllBinding[] = []
        if (rpc) rpcReExports.push({ exportAllFrom: getURL(id, rpc, isLocal), as: 'worker' })
        if (rpcGenerator) rpcReExports.push({ exportAllFrom: getURL(id, rpcGenerator, isLocal), as: 'workerGenerator' })
        runtime.addReExportModule('@masknet/plugin/utils/rpc', ...rpcReExports)

        // TODO: abort rpc when the signal is aborted
        const rpcReExport = await runtime.imports('@masknet/plugin/utils/rpc')
        if (rpc) {
            AsyncCall(rpcReExport.worker, {
                channel: channel.events.f.bind(MessageTarget.Broadcast),
                serializer,
                log: true,
                thenable: false,
            })
        }
        if (rpcGenerator) {
            AsyncGeneratorCall(rpcReExport.workerGenerator, {
                channel: channel.events.f.bind(MessageTarget.Broadcast),
                serializer,
                log: true,
                thenable: false,
            })
        }
    }
}

async function fetchManifest(id: string, isLocal: boolean) {
    const manifestPath = `/sandboxed-modules/${isLocal ? 'local-plugin' : 'plugin'}-${id}/mask-manifest.json`
    {
        const manifestURL = new URL(manifestPath, location.href)
        if (manifestURL.pathname !== manifestPath) throw new TypeError('Plugin ID is invalid.')
    }

    const manifest = await fetch(manifestPath).then((x) => x.json())
    if (!isManifest(manifest)) throw new TypeError(`${manifestPath} is not a valid manifest.`)
    return manifest
}
