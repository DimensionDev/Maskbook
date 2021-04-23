import type { Plugin } from '../types'
import { useEffect, useState, useRef } from 'react'
import { usePostInfo } from '../../components/DataSource/usePostInfo'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'
import { useActivatedPluginInstanceUI } from '../manager/ui'
type InjectHook<T> = Plugin.UI.InjectHook<T>
type RawHook<T> = Plugin.UI.RawInjectHook<T>
type ReactHook<T> = Plugin.UI.ReactInjectHook<T>

export function createInjectHooksRenderer<T>(pick: (plugin: Plugin.UI.Definition) => undefined | InjectHook<T>) {
    const picker = (plugin: Plugin.UI.Definition) => ({
        key: plugin.ID,
        name: plugin.name,
        ui: pick(plugin),
    })
    return function InjectHooksRenderer<T>(props: T) {
        const all = useActivatedPluginInstanceUI()
            .map(picker)
            .filter((x) => x.ui)
            .map(({ key, name, ui }) => (
                <ErrorBoundary key={key} subject={`Plugin ` + name.fallback}>
                    <Main UI={ui!} data={props} />
                </ErrorBoundary>
            ))
        return <>{all}</>
    }
}

function Main<T>(props: { data: T; UI: InjectHook<any> }) {
    const { data, UI } = props
    if (isRawInjectHook(UI)) return <RawHookRender UI={UI} data={data} />
    return <ReactHookRender UI={UI} data={data} />
}
function RawHookRender<T>({ UI, data }: { data: T; UI: RawHook<T> }) {
    const [ref, setRef] = useState<HTMLDivElement | null>()
    const [f, setF] = useState<(props: T) => void>()
    const cancel = useRef<AbortController>()
    const post = usePostInfo()

    useEffect(() => {
        if (!ref) return
        const sig = (cancel.current = new AbortController())
        setF(UI.init(sig.signal, post, ref))
        return () => sig.abort()
    }, [ref, UI.init, post])
    useEffect(() => void f?.(data), [f, data])

    return <div ref={(r) => ref === r || setRef(r)} />
}
function ReactHookRender<T>({ UI, data }: { data: T; UI: ReactHook<T> }) {
    return null
}
function isRawInjectHook<T>(x: InjectHook<T>): x is RawHook<T> {
    return 'type' in x && x.type === 'raw'
}
