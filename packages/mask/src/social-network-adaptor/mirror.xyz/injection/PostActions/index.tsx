import {
    createInjectHooksRenderer,
    PostInfo,
    PostInfoProvider,
    useActivatedPluginsSNSAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'
import { Plugin } from '@masknet/plugin-infra'
import { Flags } from '../../../../../shared/index.js'
import { createReactRootShadowed } from '../../../../utils'
import { noop } from 'lodash-unified'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const ActionsRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)

export function PostActions() {
    const identifier = usePostInfoDetails.author()
    const nickname = usePostInfoDetails.nickname()
    const coAuthors = usePostInfoDetails.coAuthors()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    if (!identifier) return null
    return (
        <ActionsRenderer
            // In Mirror, then profile identifier is wallet address
            tipsAccounts={[
                {
                    address: identifier.userId,
                    name: nickname ? `(${nickname}) ${Others?.formatAddress(identifier.userId, 4)}` : identifier.userId,
                },
                ...(coAuthors?.map((x) => ({
                    address: x.author.userId,
                    name: x.nickname ? `(${x.nickname}) ${Others?.formatAddress(x.author.userId, 4)}` : x.author.userId,
                })) ?? []),
            ]}
            identity={identifier}
            slot={Plugin.SNSAdaptor.TipsSlot.MirrorEntry}
        />
    )
}

function createPostActionsInjector() {
    return function injectPostActions(postInfo: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={postInfo}>
                <PostActions />
            </PostInfoProvider>
        )
        if (postInfo.actionsElement) {
            const root = createReactRootShadowed(postInfo.actionsElement.afterShadow, {
                key: 'post-actions',
                signal,
            })
            if (postInfo.actionsElement?.realCurrent?.parentNode?.lastElementChild) {
                ;(postInfo.actionsElement.realCurrent.parentNode.lastElementChild as HTMLDivElement).style.flex = '1'
                ;(postInfo.actionsElement.realCurrent.parentNode as HTMLDivElement).style.flex = '1 1 auto'
            }
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
