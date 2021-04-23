import type { Plugin } from '../types'
import { getPluginDefine } from './store'

interface ActivatedPluginInstance<U extends Plugin.Shared.DefinitionWithInit> {
    instance: U
    controller: AbortController
}
export interface CreateManagerOptions<T extends Plugin.Shared.DefinitionWithInit> {
    getLoader(deferred: Plugin.DeferredDefinition): undefined | Plugin.Loader<T>
    onActivated?(id: string): void
    onStop?(id: string): void
}
// Plugin state machine
// not-loaded => loaded
// loaded => activated (activatePlugin)
// activated => loaded (stopPlugin)
export function createManager<T extends Plugin.Shared.DefinitionWithInit>(_: CreateManagerOptions<T>) {
    const { getLoader, onActivated, onStop } = _

    const resolved = new Map<string, T>()
    const activated = new Map<string, ActivatedPluginInstance<T>>()

    return {
        activatePlugin,
        stopPlugin,
        isActivated,
        activated: {
            id: { [Symbol.iterator]: () => activated.keys() } as Iterable<string>,
            plugins: {
                *[Symbol.iterator]() {
                    for (const each of activated.values()) yield each.instance
                },
            } as Iterable<T>,
        },
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
        onActivated?.(id)
    }

    function stopPlugin(id: string) {
        const instance = activated.get(id)
        if (!instance) return
        instance.controller.abort()
        activated.delete(id)
        onStop?.(id)
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
