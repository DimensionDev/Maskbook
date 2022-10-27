import { noop } from 'lodash-unified'
import { Plugin } from '@masknet/plugin-infra'
import {
    createInjectHooksRenderer,
    PostInfo,
    PostInfoProvider,
    useActivatedPluginsSNSAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'
import { useWeb3State, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Flags } from '../../../../../shared/index.js'
import { createReactRootShadowed } from '../../../../utils'

const ActionsRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)

export function PostActions() {
    const { Others } = useWeb3State()

    const identifier = usePostInfoDetails.author()
    const nickname = usePostInfoDetails.nickname()
    const coAuthors = usePostInfoDetails.coAuthors()

    if (!identifier) return null
    return (
        <ActionsRenderer
            // In Mirror, then profile identifier is wallet address
            accounts={[
                {
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    address: identifier.userId,
                    label: nickname
                        ? `(${nickname}) ${Others?.formatAddress(identifier.userId, 4)}`
                        : identifier.userId,
                },
                ...(coAuthors?.map((x) => ({
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    address: x.author.userId,
                    label: x.nickname
                        ? `(${x.nickname}) ${Others?.formatAddress(x.author.userId, 4)}`
                        : x.author.userId,
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
            <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                <PostInfoProvider post={postInfo}>
                    <PostActions />
                </PostInfoProvider>
            </Web3ContextProvider>
        )
        if (postInfo.actionsElement) {
            const root = createReactRootShadowed(postInfo.actionsElement.afterShadow, {
                key: 'post-actions',
                signal,
            })

            const parentNode = postInfo.actionsElement?.realCurrent?.parentNode as HTMLDivElement
            if (parentNode?.lastElementChild) {
                ;(parentNode.lastElementChild as HTMLDivElement).style.flex = '1'
                parentNode.style.flex = '1 1 auto'
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
