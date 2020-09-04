import React from 'react'
import { PluginUI, PluginConfig } from '../../plugins/plugin'

export interface PageInspectorProps {}

export function PageInspector(props: PageInspectorProps) {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <PluginPageInspectorForEach key={x.identifier} config={x} />
            ))}
        </>
    )
}

function PluginPageInspectorForEach({ config }: { config: PluginConfig }) {
    const F = config.pageInspector
    if (typeof F === 'function') return <F />
    return null
}
