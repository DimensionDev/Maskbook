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

const ActionsRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)

export function PostActions({ isFocusing }: { isFocusing?: boolean }) {
    const identifier = usePostInfoDetails.author()
    const coAuthors = usePostInfoDetails.coAuthors()
    if (!identifier) return null
    return (
        <ActionsRenderer
            // In Mirror, then profile identifier is wallet address
            addresses={coAuthors?.map((x) => x.userId)}
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
