import type { Plugin } from '../types'
import { useEffect, useState, useRef, memo, createContext, useContext } from 'react'
import { ErrorBoundary } from '@masknet/shared'
import { usePluginI18NField, PluginWrapperComponent, PluginWrapperMethods } from '../hooks'
import { PluginWrapperMethodsContext } from '../hooks/usePluginWrapper'
import { ShadowRootIsolation } from '@masknet/theme'

type Inject<T> = Plugin.InjectUI<T>
type Raw<T> = Plugin.InjectUIRaw<T>

const PropsContext = createContext<unknown>(null)
export function createInjectHooksRenderer<PluginDefinition extends Plugin.Shared.Definition, PropsType>(
    usePlugins: () => PluginDefinition[],
    pickInjectorHook: (plugin: PluginDefinition) => undefined | Inject<PropsType>,
    PluginWrapperComponent?: PluginWrapperComponent<PluginDefinition>,
) {
    function usePluginWrapperProvider(element: JSX.Element | null, plugin: PluginDefinition) {
        const [ref, setRef] = useState<PluginWrapperMethods | null>(null)
        if (PluginWrapperComponent) {
            return (
                <PluginWrapperComponent definition={plugin} ref={setRef}>
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
                    <ShadowRootIsolation data-plugin={plugin.ID}>
                        <SinglePluginWithinErrorBoundary plugin={plugin} />
                    </ShadowRootIsolation>
                </PropsContext.Provider>
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
    useEffect(() => void f?.(data), [f, data])

    return <div ref={setRef} />
}
function isRawInjectHook<T>(x: Inject<T>): x is Raw<T> {
    return 'type' in x && x.type === 'raw'
}
