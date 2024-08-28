import { memo, useEffect, useRef, useState, type ComponentType, type JSX } from 'react'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { ShadowRootIsolation } from '@masknet/theme'
import {
    PluginWrapperMethodsContext,
    type PluginWrapperComponentProps,
    type PluginWrapperMethods,
} from './usePluginWrapper.js'
import { usePluginTransField } from './useTrans.js'
import type { Plugin } from '../types.js'
import { getAvailablePlugins } from '../utils/getAvailablePlugins.js'

type Inject<T> = Plugin.InjectUI<T>
type Raw<T> = Plugin.InjectUIRaw<T>

export function createInjectHooksRenderer<PluginDefinition extends Plugin.Shared.Definition, PropsType extends object>(
    usePlugins: () => readonly PluginDefinition[],
    pickInjectorHook: (plugin: PluginDefinition) => undefined | Inject<PropsType>,
    PluginWrapperComponent?: ComponentType<PluginWrapperComponentProps<PluginDefinition>> | undefined,
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
                    {ref ?
                        <PluginWrapperMethodsContext value={ref}>{element}</PluginWrapperMethodsContext>
                    :   null}
                </PluginWrapperComponent>
            )
        }
        return element
    }
    function SinglePluginWithinErrorBoundary({ plugin, props }: { plugin: PluginDefinition; props: unknown }) {
        const t = usePluginTransField()
        const ui = pickInjectorHook(plugin)
        return usePluginWrapperProvider(
            ui ?
                <ErrorBoundary subject={'Plugin ' + t(plugin.ID, plugin.name)}>
                    <Main UI={ui} data={props} />
                </ErrorBoundary>
            :   null,
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
    const { data, UI: Render } = props
    if (isRawInjectHook(Render)) return <RawHookRender UI={Render} data={data} />
    return <Render {...data} />
}
function RawHookRender<T>({ UI, data }: { data: T; UI: Raw<T> }) {
    const [ref, setRef] = useState<HTMLDivElement | null>()
    const propsCallback = useRef<(props: T) => void>(undefined)
    const cancel = useRef<AbortController>(undefined)

    useEffect(() => {
        if (!ref) return
        const sig = (cancel.current = new AbortController())
        propsCallback.current = UI.init(sig.signal, ref)
        propsCallback.current(data)
        return () => sig.abort()
    }, [ref, UI.init])
    useEffect(() => {
        propsCallback.current?.(data)
    }, [data])

    return <div ref={setRef} />
}
function isRawInjectHook<T>(x: Inject<T>): x is Raw<T> {
    return 'type' in x && x.type === 'raw'
}
