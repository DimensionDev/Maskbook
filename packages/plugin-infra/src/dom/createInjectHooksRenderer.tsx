import { memo, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { ShadowRootIsolation } from '@masknet/theme'
import {
    PluginWrapperMethodsContext,
    type PluginWrapperComponent,
    type PluginWrapperMethods,
} from './usePluginWrapper.js'
import { usePluginI18NField } from './useI18N.js'
import type { Plugin } from '../types.js'
import { getAvailablePlugins } from '../utils/getAvailablePlugins.js'

type Inject<T> = Plugin.InjectUI<T>
type Raw<T> = Plugin.InjectUIRaw<T>

export function createInjectHooksRenderer<PluginDefinition extends Plugin.Shared.Definition, PropsType extends object>(
    usePlugins: () => readonly PluginDefinition[],
    pickInjectorHook: (plugin: PluginDefinition) => undefined | Inject<PropsType>,
    PluginWrapperComponent?: PluginWrapperComponent<PluginDefinition> | undefined,
    rootElement?: 'div' | 'span' | (() => HTMLDivElement | HTMLSpanElement),
) {
    function usePluginWrapperProvider(element: JSX.Element | null, plugin: PluginDefinition) {
        const [ref, setRef] = useState<PluginWrapperMethods | null>(null)
        if (PluginWrapperComponent) {
            return (
                <PluginWrapperComponent
                    definition={plugin}
                    ref={(methods) => {
                        if (methods) setRef(methods)
                    }}>
                    {ref ? (
                        <PluginWrapperMethodsContext.Provider value={ref}>
                            {element}
                        </PluginWrapperMethodsContext.Provider>
                    ) : null}
                </PluginWrapperComponent>
            )
        }
        return element
    }
    function SinglePluginWithinErrorBoundary({ plugin, props }: { plugin: PluginDefinition; props: unknown }) {
        const t = usePluginI18NField()
        const ui = pickInjectorHook(plugin)
        return usePluginWrapperProvider(
            ui ? (
                <ErrorBoundary subject={'Plugin ' + t(plugin.ID, plugin.name)}>
                    <Main UI={ui} data={props} />
                </ErrorBoundary>
            ) : null,
            plugin,
        )
    }
    function PluginsInjectionHookRender(props: PropsType) {
        const allPlugins = usePlugins()
        const availablePlugins = getAvailablePlugins<PluginDefinition>(allPlugins)
        const all = availablePlugins.filter(pickInjectorHook).map((plugin) => (
            <ShadowRootIsolation key={plugin.ID} data-plugin={plugin.ID} rootElement={rootElement}>
                <SinglePluginWithinErrorBoundary plugin={plugin} props={props} />
            </ShadowRootIsolation>
        ))
        return <>{all}</>
    }
    return memo(function PluginsInjectionHookRenderErrorBoundary(props: PropsType) {
        return (
            <span data-plugin-render="">
                <ErrorBoundary>
                    <PluginsInjectionHookRender {...props} />
                </ErrorBoundary>
            </span>
        )
    })
}

function Main<T>(props: { data: T; UI: Inject<any> }) {
    const { data, UI } = props
    if (isRawInjectHook(UI)) return <RawHookRender UI={UI} data={data} />
    return <UI {...data} />
}
function RawHookRender<T>({ UI, data }: { data: T; UI: Raw<T> }) {
    const [ref, setRef] = useState<HTMLDivElement | null>()
    const [f, setF] = useState<(props: T) => void>()
    const cancel = useRef<AbortController>()

    useEffect(() => {
        if (!ref) return
        const sig = (cancel.current = new AbortController())
        setF(UI.init(sig.signal, ref))
        return () => sig.abort()
    }, [ref, UI.init])
    useEffect(() => {
        f?.(data)
    }, [f, data])

    return <div ref={setRef} />
}
function isRawInjectHook<T>(x: Inject<T>): x is Raw<T> {
    return 'type' in x && x.type === 'raw'
}
