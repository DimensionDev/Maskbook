import { ObservableSet } from '@masknet/shared-base'
import { Emitter } from '@servie/events'
import { noop } from 'lodash-unified'
import type { Plugin } from '../types'
import { getPluginDefine, registeredPluginIDs, registeredPlugins } from './store'

// Plugin state machine
// not-loaded => loaded
// loaded => activated (activatePlugin)
// activated => loaded (stopPlugin)
export function createManager<
    T extends Plugin.Shared.DefinitionDeferred<Context>,
    Context extends Plugin.Shared.SharedContext,
>(selectLoader: (plugin: Plugin.DeferredDefinition) => undefined | Plugin.Loader<T>) {
    interface ActivatedPluginInstance {
        instance: T
        controller: AbortController
        context: Context
    }
    const resolved = new Map<string, T>()
    const activated = new Map<string, ActivatedPluginInstance>()
    const minimalModePluginIDs = (() => {
        const value = new ObservableSet<string>()
        value.event.on('add', (id) => id.forEach((id) => events.emit('minimalModeChanged', id, true)))
        value.event.on('delete', (id) => events.emit('minimalModeChanged', id, false))
        value.clear = () => {
            throw new TypeError('[@masknet/plugin-infra] Cannot clear minimal mode plugin IDs')
        }
        return value
    })()
    let _host: Plugin.__Host.Host<Context> = undefined!
    const events = new Emitter<{
        activateChanged: [id: string, enabled: boolean]
        minimalModeChanged: [id: string, enabled: boolean]
    }>()

    return {
        configureHostHooks: (host: Plugin.__Host.Host<Context>) => (_host = host),
        activatePlugin,
        stopPlugin,
        isMinimalMode,
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
        minimalMode: {
            [Symbol.iterator]: () => minimalModePluginIDs.values(),
        } as Iterable<string>,
        events,
    }

    function startDaemon(host: Plugin.__Host.Host<Context>, extraCheck?: (id: string) => boolean) {
        _host = host
        const { signal, addI18NResource, minimalMode } = _host
        const removeListener1 = minimalMode.events.on('enabled', (id) => minimalModePluginIDs.add(id))
        const removeListener2 = minimalMode.events.on('disabled', (id) => minimalModePluginIDs.delete(id))

        signal?.addEventListener('abort', () => [...activated.keys()].forEach(stopPlugin))
        signal?.addEventListener('abort', () => void [removeListener1(), removeListener2()])

        for (const plugin of registeredPlugins) {
            plugin.i18n && addI18NResource(plugin.ID, plugin.i18n)
        }
        checkRequirementAndStartOrStop().catch(console.error)
        async function checkRequirementAndStartOrStop() {
            for (const id of registeredPluginIDs) {
                if (await meetRequirement(id)) activatePlugin(id).catch(console.error)
                else stopPlugin(id)
            }
        }

        async function meetRequirement(id: string) {
            const define = getPluginDefine(id)
            if (!define) return false
            if (extraCheck && !extraCheck(id)) return false
            return true
        }
    }

    function verifyHostHooks() {
        if (!_host)
            throw new Error(
                '[@masknet/plugin-infra] You must call configureHostHooks or startDaemon to configure host hooks.',
            )
    }

    async function activatePlugin(id: string) {
        if (activated.has(id)) return
        const definition = await __getDefinition(id)
        if (!definition) return

        Promise.resolve(_host.minimalMode.isEnabled(id)).then(
            (enabled) => (enabled ? minimalModePluginIDs.add(id) : minimalModePluginIDs.delete(id)),
            noop,
        )
        if (definition.enableRequirement.target !== 'stable' && !definition.experimentalMark) {
            console.warn(
                `[@masknet/plugin-infra] Plugin ${id} is not enabled in stable release, expected it's "experimentalMark" to be true.`,
            )
            definition.experimentalMark = true
        }

        verifyHostHooks()
        const abort = new AbortController()
        const activatedPlugin: ActivatedPluginInstance = {
            instance: definition,
            controller: abort,
            context: _host.createContext(id, abort.signal),
        }
        activated.set(id, activatedPlugin)
        await definition.init(activatedPlugin.controller.signal, activatedPlugin.context)
        events.emit('activateChanged', id, true)
    }

    function stopPlugin(id: string) {
        const instance = activated.get(id)
        if (!instance) return
        instance.controller.abort()
        activated.delete(id)
        events.emit('activateChanged', id, false)
    }

    function isActivated(id: string) {
        return activated.has(id)
    }

    function isMinimalMode(id: string) {
        return minimalModePluginIDs.has(id)
    }

    async function __getDefinition(id: string) {
        if (resolved.has(id)) return resolved.get(id)!

        const deferredDefinition = getPluginDefine(id)
        if (!deferredDefinition) return
        const loader = selectLoader(deferredDefinition)
        if (!loader) return

        const definition = (await loader.load()).default
        resolved.set(id, definition)

        if (import.meta.webpackHot) {
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
