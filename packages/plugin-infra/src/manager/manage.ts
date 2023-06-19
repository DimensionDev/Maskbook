import { noop } from 'lodash-es'
import { BooleanPreference, ObservableSet, type PluginID } from '@masknet/shared-base'
import { Emitter } from '@servie/events'
import { type Plugin } from '../types.js'
import { getPluginDefine, onNewPluginRegistered, registeredPlugins } from './store.js'
import { timeout } from '@masknet/kit'

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
    const resolved = new Map<PluginID, T>()
    const activated = new Map<PluginID, ActivatedPluginInstance>()
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

    async function updateCompositedMinimalMode(id: string) {
        const definition = await __getDefinition(id as PluginID)
        if (!definition) return

        const settings = await _host.minimalMode.isEnabled(id)
        let result: boolean
        if (settings === BooleanPreference.True) result = true
        else if (settings === BooleanPreference.False) result = false
        // plugin default minimal mode is false
        else result = !!definition.inMinimalModeByDefault

        result ? minimalModePluginIDs.add(id) : minimalModePluginIDs.delete(id)
    }

    function startDaemon(host: Plugin.__Host.Host<Context>, extraCheck?: (id: PluginID) => boolean) {
        _host = host
        const { signal = new AbortController().signal, addI18NResource, minimalMode } = _host
        const removeListener1 = minimalMode.events.on('enabled', (id) => updateCompositedMinimalMode(id))
        const removeListener2 = minimalMode.events.on('disabled', (id) => updateCompositedMinimalMode(id))
        const removeListener3 = onNewPluginRegistered((id, def) => {
            def.i18n && addI18NResource(id, def.i18n)
            checkRequirementAndStartOrStop()
        })

        signal.addEventListener(
            'abort',
            () => {
                ;[...activated.keys()].forEach(stopPlugin)
                removeListener1()
                removeListener2()
                removeListener3()
            },
            { once: true },
        )

        for (const [, plugin] of registeredPlugins.getCurrentValue()) {
            plugin.i18n && addI18NResource(plugin.ID, plugin.i18n)
        }
        checkRequirementAndStartOrStop().then().catch(console.error)

        async function checkRequirementAndStartOrStop() {
            for (const [id] of registeredPlugins.getCurrentValue()) {
                if (await meetRequirement(id)) await activatePlugin(id).catch(console.error)
                else stopPlugin(id)
            }
        }

        async function meetRequirement(id: PluginID) {
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

    async function activatePlugin(id: PluginID) {
        if (activated.has(id)) return
        const definition = await __getDefinition(id)
        if (!definition) return

        updateCompositedMinimalMode(id).catch(noop)
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
        await timeout(
            Promise.resolve(definition.init(activatedPlugin.controller.signal, activatedPlugin.context)),
            1000,
        ).catch(console.error)
        events.emit('activateChanged', id, true)
    }

    function stopPlugin(id: PluginID) {
        const instance = activated.get(id)
        if (!instance) return
        instance.controller.abort()
        activated.delete(id)
        events.emit('activateChanged', id, false)
    }

    function isActivated(id: PluginID) {
        return activated.has(id)
    }

    function isMinimalMode(id: PluginID) {
        return minimalModePluginIDs.has(id)
    }

    async function __getDefinition(id: PluginID) {
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
