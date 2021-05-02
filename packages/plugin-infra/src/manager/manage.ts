import type { Plugin } from '../types'
import { __meetEthChainRequirement } from '../utils/internal'
import { getPluginDefine, registeredPluginIDs } from './store'
import { Emitter } from '@servie/events'
import { ALL_EVENTS } from '@dimensiondev/maskbook-shared'

interface ActivatedPluginInstance<U extends Plugin.Shared.DefinitionWithInit> {
    instance: U
    controller: AbortController
}
export interface CreateManagerOptions<T extends Plugin.Shared.DefinitionWithInit> {
    getLoader(deferred: Plugin.DeferredDefinition): undefined | Plugin.Loader<T>
}
// Plugin state machine
// not-loaded => loaded
// loaded => activated (activatePlugin)
// activated => loaded (stopPlugin)
export function createManager<T extends Plugin.Shared.DefinitionWithInit>(_: CreateManagerOptions<T>) {
    const { getLoader } = _

    const resolved = new Map<string, T>()
    const activated = new Map<string, ActivatedPluginInstance<T>>()
    const events = new Emitter<{
        activated: [id: string]
        stopped: [id: string]
    }>()

    return {
        activatePlugin,
        stopPlugin,
        isActivated,
        startDaemon,
        activated: {
            id: { [Symbol.iterator]: () => activated.keys() } as Iterable<string>,
            plugins: {
                *[Symbol.iterator]() {
                    for (const each of activated.values()) yield each.instance
                },
            } as Iterable<T>,
        },
        events,
    }

    function startDaemon({ enabled, eth, signal }: Plugin.__Host.Host, extraCheck?: (id: string) => boolean) {
        const off = eth.events.on(ALL_EVENTS, checkRequirementAndStartOrStop)
        const off2 = enabled.events.on(ALL_EVENTS, checkRequirementAndStartOrStop)

        signal?.addEventListener('abort', () => [...activated.keys()].forEach(stopPlugin))
        signal?.addEventListener('abort', off)
        signal?.addEventListener('abort', off2)

        checkRequirementAndStartOrStop()
        function checkRequirementAndStartOrStop() {
            for (const id of registeredPluginIDs) {
                if (meetRequirement(id)) activatePlugin(id).catch(console.error)
                else stopPlugin(id)
            }
        }

        function meetRequirement(id: string) {
            if (!enabled.isEnabled(id)) return false
            if (extraCheck && !extraCheck(id)) return false
            return __meetEthChainRequirement(id, eth)
        }
    }

    async function activatePlugin(id: string) {
        if (activated.has(id)) return
        const definition = await __getDefinition(id)
        if (!definition) return

        const activatedPlugin: ActivatedPluginInstance<T> = {
            instance: definition,
            controller: new AbortController(),
        }
        activated.set(id, activatedPlugin)
        await definition.init(activatedPlugin.controller.signal)
        events.emit('activated', id)
    }

    function stopPlugin(id: string) {
        const instance = activated.get(id)
        if (!instance) return
        instance.controller.abort()
        activated.delete(id)
        events.emit('stopped', id)
    }

    function isActivated(id: string) {
        return activated.has(id)
    }

    async function __getDefinition(id: string) {
        if (resolved.has(id)) return resolved.get(id)!

        const deferredDefinition = getPluginDefine(id)
        if (!deferredDefinition) return
        const loader = getLoader(deferredDefinition)
        if (!loader) return

        const definition = (await loader.load()).default
        resolved.set(id, definition)

        if (module.hot) {
            loader.hotModuleReload(async (_) => {
                resolved.set(id, (await _).default)

                console.log('[HMR] Plugin', id, 'hot reloaded.')
                isActivated(id) && setTimeout(() => activatePlugin(id), 200)
                stopPlugin(id)
            })
        }
        return definition
    }
}
