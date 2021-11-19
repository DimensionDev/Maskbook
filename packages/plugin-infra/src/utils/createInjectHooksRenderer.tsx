import type { Plugin } from '../types'
import { useEffect, useState, useRef } from 'react'
import { ErrorBoundary } from '@masknet/shared'
import { StyleIsolatePortal } from '@masknet/theme'
type Inject<T> = Plugin.InjectUI<T>
type Raw<T> = Plugin.InjectUIRaw<T>

export function createInjectHooksRenderer<PluginDefinition extends Plugin.Shared.Definition, PropsType>(
    usePlugins: () => PluginDefinition[],
    pickInjector: (plugin: PluginDefinition) => undefined | Inject<PropsType>,
): React.FunctionComponent<PropsType> {
    const picker = (plugin: PluginDefinition) => ({
        key: plugin.ID,
        name: plugin.name,
        ui: pickInjector(plugin),
    })
    function InjectHooksRenderer(props: PropsType) {
        const all = usePlugins()
            .map(picker)
            .filter((x) => x.ui)
            .map(({ key, name, ui }) => (
                // TODO: i18n
                <ErrorBoundary key={key} subject={`Plugin ` + name.fallback}>
                    <StyleIsolatePortal data-plugin={key}>
                        <Main UI={ui!} data={props} />
                    </StyleIsolatePortal>
                </ErrorBoundary>
            ))
        return <>{all}</>
    }
    return function (props: PropsType) {
        return (
            <ErrorBoundary>
                <InjectHooksRenderer {...props} />
            </ErrorBoundary>
        )
    }
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
