import type { Plugin } from '../types'
import React, { useEffect, useState, useRef, memo, createContext, useContext } from 'react'
import { ErrorBoundary } from '@masknet/shared'
import { usePluginI18NField, PluginWrapperProvider } from '../hooks'
type Inject<T> = Plugin.InjectUI<T>
type Raw<T> = Plugin.InjectUIRaw<T>

const PropsContext = createContext<unknown>(null)
export function createInjectHooksRenderer<PluginDefinition extends Plugin.Shared.Definition, PropsType>(
    usePlugins: () => PluginDefinition[],
    pickInjectorHook: (plugin: PluginDefinition) => undefined | Inject<PropsType>,
    maskWrapperProvider?: (plugin: PluginDefinition) => React.ComponentType<React.PropsWithChildren<{}>>,
) {
    function usePluginWrapperProvider(element: JSX.Element | null, plugin: PluginDefinition) {
        const Wrapper = useRef<React.ComponentType<{}> | false>()
        if (Wrapper.current === undefined || Wrapper.current === null) {
            Wrapper.current = maskWrapperProvider?.(plugin) || false
        }
        if (Wrapper.current) return <PluginWrapperProvider value={Wrapper.current}>{element}</PluginWrapperProvider>
        return element
    }
    function SinglePluginWithinErrorBoundary({ plugin }: { plugin: PluginDefinition }) {
        const t = usePluginI18NField()
        const props = useContext(PropsContext)
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
        const all = usePlugins()
            .filter(pickInjectorHook)
            .map((plugin) => (
                <PropsContext.Provider key={plugin.ID} value={props}>
                    <SinglePluginWithinErrorBoundary key={plugin.ID} plugin={plugin} />
                </PropsContext.Provider>
            ))
        return <>{all}</>
    }
    return memo(function PluginsInjectionHookRenderErrorBoundary(props: PropsType) {
        return (
            <ErrorBoundary>
                <PluginsInjectionHookRender {...props} />
            </ErrorBoundary>
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
    useEffect(() => void f?.(data), [f, data])

    return <div ref={(r) => ref === r || setRef(r)} />
}
function isRawInjectHook<T>(x: Inject<T>): x is Raw<T> {
    return 'type' in x && x.type === 'raw'
}
