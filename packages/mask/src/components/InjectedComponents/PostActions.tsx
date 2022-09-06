import {
    createInjectHooksRenderer,
    Plugin,
    useActivatedPluginsSNSAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'

const ActionsRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)

export function PostActions({ isFocusing }: { isFocusing?: boolean }) {
    const identifier = usePostInfoDetails.author()
    if (!identifier) return null
    return (
        <ActionsRenderer
            identity={identifier}
            slot={isFocusing ? Plugin.SNSAdaptor.TipsSlot.FocusingPost : Plugin.SNSAdaptor.TipsSlot.Post}
        />
    )
}
