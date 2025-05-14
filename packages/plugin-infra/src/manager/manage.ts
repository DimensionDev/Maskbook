import { noop } from 'lodash-es'
import { timeout } from '@masknet/kit'
import { Emitter } from '@servie/events'
import { BooleanPreference, ValueRefWithReady } from '@masknet/shared-base'
import { type Plugin } from '../types.js'
import { getPluginDefine, onNewPluginRegistered, registeredPlugins } from './store.js'

// Plugin state machine
// not-loaded => loaded
// loaded => activated (activatePlugin)
// activated => loaded (stopPlugin)
export function createManager<
    T extends Plugin.Shared.DefinitionDeferred<Context>,
    Context extends Plugin.Shared.SharedContext,
    ManagedContext extends keyof Context = never,
>(
    selectLoader: (plugin: Plugin.DeferredDefinition) => undefined | Plugin.Loader<T>,
    getManagedContext: (pluginID: string, signal: AbortSignal) => Pick<Context, ManagedContext>,
) {
    interface ActivatedPluginInstance {
        instance: T
        controller: AbortController
        context: Context
        minimalModeEnabled: ValueRefWithReady<boolean>
    }
    const resolved = new Map<string, T>()
    const activated = new Map<string, ActivatedPluginInstance>()
    let _host: Plugin.__Host.Host<T, Omit<Context, ManagedContext>> = undefined!
    const events = new Emitter<{
        activateChanged: [id: string, enabled: boolean]
        minimalModeChanged: [id: string, enabled: boolean]
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
        minimalMode: new Proxy(
            {},
            {
                get(_, pluginID) {
                    if (typeof pluginID === 'symbol') return undefined
                    if (activated.has(pluginID)) return activated.get(pluginID)!.minimalModeEnabled
                    return undefined
                },
            },
        ) as Partial<Record<string, ValueRefWithReady<boolean>>>,
        events,
    }

    async function updateCompositedMinimalMode(id: string) {
        const definition = await __getDefinition(id)
        if (!definition) return

        const settings = await _host.minimalMode.isEnabled(id)
        let result: boolean
        if (settings === BooleanPreference.True) result = true
        else if (settings === BooleanPreference.False) result = false
        // plugin default minimal mode is false
        else result = !!definition.inMinimalModeByDefault

        const instance = activated.get(id)
        if (instance) instance.minimalModeEnabled.value = result
        events.emit('minimalModeChanged', id, result)
    }

    function startDaemon(
        host: Plugin.__Host.Host<T, Omit<Context, ManagedContext>>,
        extraCheck?: (id: string) => boolean,
    ) {
        _host = host
        const { signal = new AbortController().signal, addI18NResource, minimalMode } = _host
        const removeListener1 = minimalMode.events.on('enabled', (id) => updateCompositedMinimalMode(id))
        const removeListener2 = minimalMode.events.on('disabled', (id) => updateCompositedMinimalMode(id))
        const removeListener3 = onNewPluginRegistered((id, define) => {
            define.i18n && addI18NResource(id, define.i18n)
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

        async function meetRequirement(id: string) {
            const define = getPluginDefine(id)
            if (!define) return false

            if (extraCheck && !extraCheck(id)) return false
            return (await _host.disabled.isEnabled(id)) === BooleanPreference.True
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
            context: {
                ...getManagedContext(id, abort.signal),
                ..._host.createContext(id, definition, abort.signal),
            } as any,
            minimalModeEnabled: new ValueRefWithReady(),
        }
        activated.set(id, activatedPlugin)
        if (definition.init) {
            await timeout(
                Promise.resolve(definition.init(activatedPlugin.controller.signal, activatedPlugin.context)),
                1000,
                `Plugin ${id} init() timed out.`,
            ).catch(console.error)
        }
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

createManager.NoManagedContext = () => ({})
