import { hmr } from '../../utils-pure'
import { SiteAdaptorInstance, SiteAdaptorPluginHost } from '@masknet/sandboxed-plugin-runtime/site-adaptor'
import { Flags } from '../../shared/flags'
import { Plugin, registerPlugin } from '@masknet/plugin-infra'
import { createHostAPIs } from '../../shared/sandboxed-plugin/host-api'

const { signal } = hmr(import.meta.webpackHot)
let hot: Map<string, (hot: Promise<{ default: Plugin.SNSAdaptor.Definition }>) => void> | undefined
if (process.env.NODE_ENV === 'development') {
    const sym = Symbol.for('sandboxed plugin bridge hot map')
    hot = (globalThis as any)[sym] ??= new Map()
}

if (Flags.sandboxedPluginRuntime) {
    const host = new SiteAdaptorPluginHost(
        {
            ...createHostAPIs(false),
        },
        process.env.NODE_ENV === 'development',
        signal,
    )
    host.__builtInPluginInfraBridgeCallback__ = __builtInPluginInfraBridgeCallback__
    host.onPluginListUpdate()
}
function __builtInPluginInfraBridgeCallback__(this: SiteAdaptorPluginHost, id: string) {
    let instance: SiteAdaptorInstance | undefined

    const base: Plugin.Shared.Definition = {
        enableRequirement: {
            architecture: { web: true, app: true },
            networks: { type: 'opt-out', networks: {} },
            target: 'beta',
        },
        ID: id,
        // TODO: read i18n files
        // TODO: read the name from the manifest
        name: { fallback: '__generated__bridge__plugin__' + id },
        experimentalMark: true,
    }
    const def: Plugin.DeferredDefinition = {
        ...base,
        SNSAdaptor: {
            hotModuleReload: (reload) => hot?.set(id, reload),
            async load() {
                return { default: worker }
            },
        },
    }
    const worker: Plugin.SNSAdaptor.Definition = {
        ...base,
        init: async (signal, context) => {
            try {
                const [i] = await this.startPlugin_bridged(id, signal)
                instance = i
            } catch (error) {
                console.error(`[Sandboxed-plugin] Plugin ${id} stopped due to an error when starting.`, error)
            }
        },
    }
    if (hot?.has(id)) hot.get(id)!(def.SNSAdaptor!.load())
    else registerPlugin(def)
}
