import {
    useActivatedPluginsSNSAdaptor,
    registeredPlugins,
    usePostInfoDetails,
    Option,
    Plugin,
} from '@masknet/plugin-infra'
import { extractTextFromTypedMessage } from '@masknet/shared-base'
import { Switch } from '@mui/material'
import Services from '../../extension/service'
import MaskPluginWrapper from '../../plugins/MaskPluginWrapper'
import { useI18N } from '../../utils'

function useDisabledPlugins() {
    const activated = new Set(useActivatedPluginsSNSAdaptor('any').map((x) => x.ID))
    const minimalMode = new Set(useActivatedPluginsSNSAdaptor(true).map((x) => x.ID))

    return [...registeredPlugins].filter((x) => !activated.has(x.ID) || minimalMode.has(x.ID))
}

export function useDisabledPluginSuggestionFromPost(postContent: Option<string>, metaLinks: string[]) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.postContent)

    const { some } = postContent

    return disabled.filter((x) => {
        for (const pattern of x.contribution!.postContent!) {
            if (some && postContent.val.match(pattern)) return true
            if (metaLinks.some((link) => link.match(pattern))) return true
        }
        return false
    })
}

export function useDisabledPluginSuggestionFromMeta(meta: ReadonlyMap<string, unknown>) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.metadataKeys)
    const keys = [...meta.keys()]

    return disabled.filter((x) => {
        const contributes = x.contribution!.metadataKeys!
        return keys.some((key) => contributes.has(key))
    })
}

export function PossiblePluginSuggestionPostInspector() {
    const message = extractTextFromTypedMessage(usePostInfoDetails.rawMessage())
    const metaLinks = usePostInfoDetails.mentionedLinks()
    const matches = useDisabledPluginSuggestionFromPost(message, metaLinks)
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
                    action={
                        <Switch
                            sx={{ marginRight: '-12px' }}
                            onChange={() => Services.Settings.setPluginMinimalModeEnabled(x.ID, false)}
                        />
                    }
                />
            ))}
        </>
    )
}
