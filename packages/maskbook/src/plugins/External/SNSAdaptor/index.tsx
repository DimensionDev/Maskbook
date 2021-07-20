import type { Plugin } from '@masknet/plugin-infra'
import { Suspense } from 'react'
import { ExternalPluginLoader } from '../components/Container'
import type { ExternalPluginLoadDetails } from '../types'
import { base } from '../base'
import { ThirdPartyPluginCompositionEntry } from '../components/CompositionEntry'

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
    CompositionDialogEntry: { label: '🧩 Third party plugins', dialog: ThirdPartyPluginCompositionEntry },
    CompositionDialogMetadataBadgeRender: (key, val) =>
        key.startsWith('plugin:')
            ? {
                  text: `A 3rd party plugin (${key})`,
                  tooltip: `It's inner content: ${JSON.stringify(val)}`,
              }
            : null,
}

export default sns
// plugin:dimensiondev.github.io/Mask-Plugin-Example/@v1
function parse(x: string) {
    let [address, ...key] = x.slice('plugin:'.length).split('@')
    if (!address.endsWith('/')) address += '/'
    const isLocalhost = new URL('https://' + address).hostname
    return [(isLocalhost ? 'http://' : 'https://') + address, key.join('@')]
}
