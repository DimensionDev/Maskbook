import { SocialNetworkUI, PostInfo } from '../ui'
import { MutationObserverWatcher, ValueRef, DomProxy } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PostComment } from '../../components/InjectedComponents/PostComments'

interface injectPostCommentsDefaultConfig {
    needZip?(): void
    getInjectionPoint?(node: DomProxy<HTMLElement & Node, HTMLSpanElement, HTMLSpanElement>): ShadowRoot
}
/**
 * Creat a default implementation of injectPostComments
 */
export function injectPostCommentsDefault(config: injectPostCommentsDefaultConfig = {}) {
    const { needZip, getInjectionPoint } = config
    return function injectPostComments(this: SocialNetworkUI, current: PostInfo) {
        const selector = current.commentsSelector
        const commentWatcher = new MutationObserverWatcher(selector, current.rootNode)
            .useForeach(commentNode => {
                const commentRef = new ValueRef(commentNode.current.innerText)
                const needZipDefault = () => {
                    commentNode.current.style.whiteSpace = 'nowrap'
                    commentNode.current.style.overflow = 'hidden'
                }
                const injectionPointDefault = () => commentNode.afterShadow
                const unmount = renderInShadowRoot(
                    <PostComment
                        needZip={needZip || needZipDefault}
                        decryptedPostContent={current.decryptedPostContent}
                        commentContent={commentRef}
                        postPayload={current.postPayload}
                    />,
                    (getInjectionPoint || injectionPointDefault)(commentNode),
                )
                return {
                    onNodeMutation() {
                        commentRef.value = commentNode.current.innerText
                    },
                    onTargetChanged() {
                        commentRef.value = commentNode.current.innerText
                    },
                    onRemove() {
                        unmount()
                    },
                }
            })
            .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .startWatch()

        return () => commentWatcher.stopWatch()
    }
}
