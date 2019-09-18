import React from 'react'
import { PostInfo, SocialNetworkUI } from '../ui'
import { DOMProxy, MutationObserverWatcher, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PostComment } from '../../components/InjectedComponents/PostComments'
import { nop } from '../../utils/utils'

interface injectPostCommentsDefaultConfig {
    needZip?(): void
    getInjectionPoint?(node: DOMProxy<HTMLElement & Node, HTMLSpanElement, HTMLSpanElement>): ShadowRoot
}
/**
 * Creat a default implementation of injectPostComments
 */
export function injectPostCommentsDefault(config: injectPostCommentsDefaultConfig = {}) {
    const { needZip, getInjectionPoint } = config
    return function injectPostComments(this: SocialNetworkUI, current: PostInfo) {
        const selector = current.commentsSelector
        if (!selector) return nop
        const commentWatcher = new MutationObserverWatcher(selector, current.rootNode)
            .useForeach((commentNode, key, meta) => {
                const commentRef = new ValueRef(commentNode.innerText)
                const needZipDefault = () => {
                    commentNode.style.whiteSpace = 'nowrap'
                    commentNode.style.overflow = 'hidden'
                }
                const injectionPointDefault = () => meta.afterShadow
                const unmount = renderInShadowRoot(
                    <PostComment
                        needZip={needZip || needZipDefault}
                        decryptedPostContent={current.decryptedPostContent}
                        commentContent={commentRef}
                        postPayload={current.postPayload}
                    />,
                    (getInjectionPoint || injectionPointDefault)(meta),
                )
                return {
                    onNodeMutation() {
                        commentRef.value = commentNode.innerText
                    },
                    onTargetChanged() {
                        commentRef.value = commentNode.innerText
                    },
                    onRemove() {
                        unmount()
                    },
                }
            })
            .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .startWatch()

        return () => commentWatcher.stopWatch()
    }
}
