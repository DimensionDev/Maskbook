import React from 'react'
import { PostInfo, SocialNetworkUI } from '../ui'
import { DOMProxy, MutationObserverWatcher, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PostComment, PostCommentProps } from '../../components/InjectedComponents/PostComments'
import { nop } from '../../utils/utils'
import { makeStyles } from '@material-ui/core'

interface injectPostCommentsDefaultConfig {
    needZip?(): void
    getInjectionPoint?(node: DOMProxy<HTMLElement & Node, HTMLSpanElement, HTMLSpanElement>): ShadowRoot
}
/**
 * Creat a default implementation of injectPostComments
 */
export function injectPostCommentsDefault<T extends string>(
    config: injectPostCommentsDefaultConfig = {},
    additionalPropsToPostComment: (classes: Record<T, string>) => Partial<PostCommentProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const { needZip, getInjectionPoint } = config
    const PostCommentDefault = React.memo((props: Pick<PostCommentProps, 'needZip' | 'comment'> & PostInfo) => {
        const classes = useCustomStyles()
        const additional = additionalPropsToPostComment(classes)
        return (
            <PostComment
                needZip={props.needZip}
                decryptedPostContent={props.decryptedPostContent}
                comment={props.comment}
                postPayload={props.postPayload}
                {...additional}
            />
        )
    })
    return function injectPostComments(current: PostInfo) {
        const selector = current.commentsSelector
        if (!selector) return nop
        const commentWatcher = new MutationObserverWatcher(selector, current.rootNode)
            .useForeach((commentNode, key, meta) => {
                const commentRef = new ValueRef(commentNode.innerText)
                const needZipF =
                    needZip ||
                    (() => {
                        commentNode.style.whiteSpace = 'nowrap'
                        commentNode.style.overflow = 'hidden'
                    })
                const injectionPointDefault = () => meta.afterShadow
                const unmount = renderInShadowRoot(
                    <PostCommentDefault needZip={needZipF} comment={commentRef} {...current} />,
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
            .startWatch({
                childList: true,
                subtree: true,
            })

        return () => commentWatcher.stopWatch()
    }
}
