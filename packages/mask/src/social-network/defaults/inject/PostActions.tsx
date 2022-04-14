import { noop } from 'lodash-unified'
import { PostInfoProvider, type PostInfo } from '@masknet/plugin-infra/content-script'
import { PostActions } from '../../../components/InjectedComponents/PostActions'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'

export function createPostActionsInjector() {
    return function injectPostActions(current: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={current}>
                <PostActions />
            </PostInfoProvider>
        )
        if (current.actionsElement) {
            const root = createReactRootShadowed(current.actionsElement.afterShadow, {
                key: 'post-actions',
                signal,
            })
            root.render(jsx)
            return root.destroy
        }
        return noop
    }
}
