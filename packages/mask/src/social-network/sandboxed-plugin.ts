import { Children, createElement } from 'react'
import { type SiteAdaptorInstance, SiteAdaptorPluginHost } from '@masknet/sandboxed-plugin-runtime/site-adaptor'
import { Flags } from '@masknet/flags'
import { type Plugin, registerPlugin } from '@masknet/plugin-infra'
import { ApplicationBoardModal } from '@masknet/shared'
import type { PluginID } from '@masknet/shared-base'
import { hmr } from '../../utils-pure/index.js'
import { createHostAPIs } from '../../shared/sandboxed-plugin/host-api.js'

const { signal } = hmr(import.meta.webpackHot)
if (import.meta.webpackHot) import.meta.webpackHot.accept()

let hot:
    | Map<
          string,
          (
              hot: Promise<{
                  default: Plugin.SNSAdaptor.Definition
              }>,
          ) => void
      >
    | undefined
if (process.env.NODE_ENV === 'development') {
    const sym = Symbol.for('sandboxed plugin bridge hot map')
    hot = (globalThis as any)[sym] ??= new Map()
}

if (Flags.sandboxedPluginRuntime) {
    const host = new SiteAdaptorPluginHost(
        {
            ...createHostAPIs(false),
            // TODO: implement this
            attachCompositionMetadata(plugin, id, meta) {},
            // TODO: implement this
            dropCompositionMetadata(plugin, id) {},
            closeApplicationBoardDialog() {
                ApplicationBoardModal.close()
            },
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
            networks: { type: 'opt-out', networks: {} },
            target: 'beta',
        },
        ID: id as PluginID,
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
                return { default: sns }
            },
        },
    }

    const sns: Plugin.SNSAdaptor.Definition = {
        ...base,
        init: async (signal, context) => {
            try {
                const [i] = await this.startPlugin_bridged(id, signal)
                instance = i
            } catch (error) {
                console.error(`[Sandboxed-plugin] Plugin ${id} stopped due to an error when starting.`, error)
            }
        },
        get CompositionDialogEntry() {
            if (!instance?.CompositionEntry) return undefined
            return {
                label: Children.only(instance.CompositionEntry.label),
                dialog({ onClose, open }: Plugin.SNSAdaptor.CompositionDialogEntry_DialogProps) {
                    if (open) return createElement(instance!.CompositionEntry!.dialog as any, { onClose, open })
                    return null
                },
            }
        },
        CompositionDialogMetadataBadgeRender(key, meta) {
            if (!key.startsWith(id + ':')) return null
            const k = key.slice(id.length + 1)
            return instance!.CompositionDialogMetadataBadgeRender(k, meta)
        },
    }
    if (hot?.has(id)) hot.get(id)!(def.SNSAdaptor!.load())
    else registerPlugin(def)
}
