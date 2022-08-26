import { startPluginWorker, Plugin } from '@masknet/plugin-infra/background-worker'
import { createPluginDatabase } from '../../database/plugin-db'
import { createPluginHost, createSharedContext } from '../../../shared/plugin-infra/host'
import { getPluginMinimalModeEnabled } from '../../services/settings/old-settings-accessor'
import { hmr } from '../../../utils-pure'
import { BackgroundPluginHost } from '@masknet/sandboxed-plugin-runtime/background'
import { Flags } from '../../../shared/flags'
import { MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'

const { signal } = hmr(import.meta.webpackHot)
startPluginWorker(createPluginHost(signal, createWorkerContext, getPluginMinimalModeEnabled))
if (Flags.sandboxedPluginRuntime) {
    new BackgroundPluginHost(
        {
            async getPluginList() {
                const plugins = await fetch('/sandboxed-modules/plugins.json').then((x) => x.json())
                return Object.entries(plugins)
            },
            async fetchManifest(id, isLocal) {
                const prefix = isLocal ? 'local-plugin' : 'plugin'
                const manifestPath = `/sandboxed-modules/${prefix}-${id}/mask-manifest.json`
                const manifestURL = new URL(manifestPath, location.href)
                if (manifestURL.pathname !== manifestPath) throw new TypeError('Plugin ID is invalid.')
                return fetch(manifestPath).then((x) => x.json())
            },
            createRpcChannel(id) {
                return new WebExtensionMessage<{ f: any }>({ domain: `mask-plugin-${id}-rpc` }).events.f.bind(
                    MessageTarget.Broadcast,
                )
            },
            createRpcGeneratorChannel(id) {
                return new WebExtensionMessage<{ g: any }>({ domain: `mask-plugin-${id}-rpc` }).events.g.bind(
                    MessageTarget.Broadcast,
                )
            },
        },
        process.env.NODE_ENV === 'development',
        signal,
    ).init()
}

function createWorkerContext(pluginID: string, signal: AbortSignal): Plugin.Worker.WorkerContext {
    let storage: Plugin.Worker.DatabaseStorage<any> = undefined!

    return {
        ...createSharedContext(pluginID, signal),
        getDatabaseStorage() {
            return storage || (storage = createPluginDatabase(pluginID, signal))
        },
    }
}
