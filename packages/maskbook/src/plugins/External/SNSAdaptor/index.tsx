import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { Suspense } from 'react'
import { ExternalPluginLoader } from '../components/Container'
import type { ExternalPluginLoadDetails } from '../types'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const tm = props.message
        if (!tm.meta) return null
        let JSX: ExternalPluginLoadDetails[] = []
        for (const [key, meta] of tm.meta) {
            if (!key.startsWith('plugin:')) continue
            const [url, metaKey] = parse(key)
            JSX.push({ meta, metaKey, url })
        }
        // Loader itself has some async work and no need to display loading fallback
        return (
            <Suspense fallback={null}>
                <ExternalPluginLoader plugins={JSX} />
            </Suspense>
        )
    },
}

export default sns
// plugin:dimensiondev.github.io/Mask-Plugin-Example/@v1
function parse(x: string) {
    let [address, ...key] = x.slice('plugin:'.length).split('@')
    if (!address.endsWith('/')) address += '/'
    const isLocalhost = new URL('https://' + address).hostname
    return [(isLocalhost ? 'http://' : 'https://') + address, key.join('@')]
}
