import {
    createInjectHooksRenderer,
    Plugin,
    useActivatedPluginsSiteAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'

const ActionsRenderer = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)

export function PostActions() {
    const identifier = usePostInfoDetails.author()
    if (!identifier) return null
    return <ActionsRenderer identity={identifier} slot={Plugin.SiteAdaptor.TipsSlot.Post} />
}
