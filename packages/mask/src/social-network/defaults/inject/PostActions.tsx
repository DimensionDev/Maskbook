import { noop } from 'lodash-unified'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { PostActions } from '../../../components/InjectedComponents/PostActions'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import type { PostInfo } from '../../PostInfo'

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
