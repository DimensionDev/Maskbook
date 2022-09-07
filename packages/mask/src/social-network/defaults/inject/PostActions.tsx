import { noop } from 'lodash-unified'
import { PostInfoProvider, type PostInfo } from '@masknet/plugin-infra/content-script'
import { PostActions } from '../../../components/InjectedComponents/PostActions'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'

export function createPostActionsInjector() {
    return function injectPostActions(postInfo: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={postInfo}>
                <PostActions isFocusing={postInfo.isFocusing} />
            </PostInfoProvider>
        )
        if (postInfo.actionsElement) {
            const root = createReactRootShadowed(postInfo.actionsElement.afterShadow, {
                key: 'post-actions',
                signal,
            })
            if (postInfo.actionsElement?.realCurrent?.parentNode) {
                const actionsContainer = postInfo.actionsElement.realCurrent.parentNode as HTMLDivElement
                actionsContainer.style.maxWidth = '100%'
            }
            root.render(jsx)
            return root.destroy
        }
        return noop
    }
}
