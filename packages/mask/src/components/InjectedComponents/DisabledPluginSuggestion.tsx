import {
    useActivatedPluginsSNSAdaptor,
    registeredPlugins,
    usePostInfoDetails,
    Result,
    Plugin,
} from '@masknet/plugin-infra'
import { extractTextFromTypedMessage } from '@masknet/shared-base'
import { Switch } from '@mui/material'
import Services from '../../extension/service'
import MaskPluginWrapper from '../../plugins/MaskPluginWrapper'
import { useI18N } from '../../utils'

function useDisabledPlugins() {
    const activated = new Set(useActivatedPluginsSNSAdaptor().map((x) => x.ID))
    const disabledPlugins = [...registeredPlugins].filter((x) => !activated.has(x.ID))
    return disabledPlugins
}

export function useDisabledPluginSuggestionFromPost(postContext: Result<string, any>) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.postContent)

    if (postContext.err) return []
    const matches = disabled.filter((x) => {
        for (const pattern of x.contribution!.postContent!) {
            if (postContext.val.match(pattern)) return true
        }
        return false
    })
    return matches
}

export function useDisabledPluginSuggestionFromMeta(meta: ReadonlyMap<string, unknown>) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.metadataKeys)
    const keys = [...meta.keys()]

    const matches = disabled.filter((x) => {
        const contributes = x.contribution!.metadataKeys!
        return keys.some((key) => contributes.has(key))
    })
    return matches
}

export function PossiblePluginSuggestionPostInspector() {
    const message = extractTextFromTypedMessage(usePostInfoDetails.postMessage())
    const matches = useDisabledPluginSuggestionFromPost(message)
    return <PossiblePluginSuggestionUI plugins={matches} />
}
export function PossiblePluginSuggestionUI(props: { plugins: Plugin.DeferredDefinition[] }) {
    const { t } = useI18N()
    const { plugins } = props
    if (!plugins.length) return null
    return (
        <>
            {plugins.map((x) => (
                <MaskPluginWrapper
                    key={x.ID}
                    pluginName={t('plugin_not_enabled', { plugin: x.name.fallback })}
                    action={<Switch onChange={() => Services.Settings.setPluginEnabled(x.ID, true)} />}
                />
            ))}
        </>
    )
}
