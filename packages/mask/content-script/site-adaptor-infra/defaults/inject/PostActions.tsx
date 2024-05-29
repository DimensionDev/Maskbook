import { noop } from 'lodash-es'
import { PostInfoContext, type PostInfo } from '@masknet/plugin-infra/content-script'
import { PostActions } from '../../../components/InjectedComponents/PostActions.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'

function createRootElement() {
    const root = document.createElement('div')
    Object.assign(root.style, {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    })
    return root
}

export function createPostActionsInjector() {
    return function injectPostActions(postInfo: PostInfo, signal: AbortSignal) {
        if (postInfo.actionsElement) {
            const jsx = (
                <PostInfoContext value={postInfo}>
                    <PostActions />
                </PostInfoContext>
            )
            const root = attachReactTreeWithContainer(postInfo.actionsElement.afterShadow, {
                tag: createRootElement,
                key: 'post-actions',
                untilVisible: true,
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
