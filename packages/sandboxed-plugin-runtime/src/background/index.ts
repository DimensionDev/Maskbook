import { PluginRuntime } from '../runtime/runtime.js'
import { getURL } from '../runtime/utils.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { AsyncCall } from 'async-call-rpc'
import { MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { serializer } from '@masknet/shared-base'

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
    const manifestPath = `/sandboxed-modules/${isLocal ? 'local-plugin' : 'plugin'}-${id}/mask-manifest.json`
    {
        const manifestURL = new URL(manifestPath, location.href)
        if (manifestURL.pathname !== manifestPath) throw new TypeError('Plugin ID is invalid.')
    }

    const manifest = await fetch(manifestPath).then((x) => x.json())
    // TODO: check shape of the manifest
    const runtime = new PluginRuntime(id, {}, signal)
    addPeerDependencies(runtime)

    const { background, rpc } = manifest.entries
    if (background) await runtime.imports(getURL(id, background, isLocal))
    if (rpc) {
        const channel = new WebExtensionMessage<{ _: any; $: any }>({ domain: `mask-plugin-${id}-rpc` })
        const rpcFull = getURL(id, rpc, isLocal)

        runtime.addReExportModule('@masknet/plugin/utils/rpc', {
            export: 'worker',
            from: rpcFull,
        })
        AsyncCall(runtime.imports(rpcFull), {
            channel: channel.events._.bind(MessageTarget.Broadcast),
            serializer,
            log: true,
            thenable: false,
        })
    }
    // TODO: support AsyncGeneratorCall
}
