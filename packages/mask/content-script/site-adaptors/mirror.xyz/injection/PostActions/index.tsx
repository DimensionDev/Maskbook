import { noop } from 'lodash-es'
import { Plugin } from '@masknet/plugin-infra'
import {
    createInjectHooksRenderer,
    type PostInfo,
    PostInfoProvider,
    useActivatedPluginsSiteAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'
import { DefaultWeb3ContextProvider, useWeb3Utils } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Flags } from '@masknet/flags'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'

const ActionsRenderer = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)

function PostActions() {
    const Utils = useWeb3Utils()

    const identifier = usePostInfoDetails.author()
    const nickname = usePostInfoDetails.nickname() as string | null
    const coAuthors = usePostInfoDetails.coAuthors()

    if (!identifier) return null
    return (
        <ActionsRenderer
            // In Mirror, then profile identifier is wallet address
            accounts={[
                {
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    address: identifier.userId,
                    label: nickname ? `(${nickname}) ${Utils.formatAddress(identifier.userId, 4)}` : identifier.userId,
                },
                ...(coAuthors?.map((x) => ({
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    address: x.author.userId,
                    label: x.nickname ? `(${x.nickname}) ${Utils.formatAddress(x.author.userId, 4)}` : x.author.userId,
                })) ?? []),
            ]}
            identity={identifier}
            slot={Plugin.SiteAdaptor.TipsSlot.MirrorEntry}
        />
    )
}

function createPostActionsInjector() {
    return function injectPostActions(postInfo: PostInfo, signal: AbortSignal) {
        const jsx = (
            <DefaultWeb3ContextProvider>
                <PostInfoProvider post={postInfo}>
                    <PostActions />
                </PostInfoProvider>
            </DefaultWeb3ContextProvider>
        )
        if (postInfo.actionsElement) {
            const root = attachReactTreeWithContainer(postInfo.actionsElement.afterShadow, {
                key: 'post-actions',
                signal,
            })

            root.render(jsx)
            return root.destroy
        }
        return noop
    }
}

export function injectPostActionsAtMirror(signal: AbortSignal, postInfo: PostInfo) {
    if (!Flags.post_actions_enabled) return
    const injector = createPostActionsInjector()
    return injector(postInfo, signal)
}
