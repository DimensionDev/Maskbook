import { SnackbarContent } from '@mui/material'
import { useAsyncRetry } from 'react-use'
import { Suspense, useRef } from 'react'
import type { ExternalPluginLoadDetails } from '../types'
import { UnknownPluginLoadRequestUI } from './UnknownPluginLoadRequest'
import { ExternalPluginRenderer } from './ExternalPluginRenderer'
export interface ExternalPluginContainerProps {
    plugins: ExternalPluginLoadDetails[]
}
export function ExternalPluginLoader(props: ExternalPluginContainerProps) {
    // TODO: this section should use suspense and it will more nature
    const { loading, value, retry } = useAsyncRetry(() => filterPlugin(props.plugins), [props.plugins.join('@')])
    const ref = useRef(value)
    if (!ref.current && loading) return null
    ref.current = value
    if (!ref.current) return null
    //
    const { known, unknown } = ref.current
    return (
        <>
            <UnknownPluginLoadRequestUI
                plugins={unknown}
                onConfirm={(list) => {
                    list.forEach((x) => allowed.add(x.url))
                    retry()
                }}
            />
            {known.map((x) => (
                <Suspense key={x.url} fallback={<SnackbarContent message={`Plugin "${x.url}" is still loading...`} />}>
                    <ExternalPluginRenderer {...x} />
                </Suspense>
            ))}
        </>
    )
}
const allowed = new Set<string>()
/** This function should query which plugin can be loaded directly. */
async function filterPlugin(plugins: ExternalPluginLoadDetails[]) {
    return {
        unknown: plugins.filter((x) => !allowed.has(x.url)),
        known: plugins.filter((x) => allowed.has(x.url)),
    }
}
