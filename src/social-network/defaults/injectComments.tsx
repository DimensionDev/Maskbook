import React from 'react'
import type { PostInfo } from '../PostInfo'
import { DOMProxy, MutationObserverWatcher, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { PostComment, PostCommentProps } from '../../components/InjectedComponents/PostComments'
import { noop } from 'lodash-es'
import { makeStyles } from '@material-ui/core'
import { PostInfoContext, usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { PreferShadowRootMode } from '../../utils/constants'

interface injectPostCommentsDefaultConfig {
    needZip?(): void
}
/**
 * Creat a default implementation of injectPostComments
 */
export function injectPostCommentsDefault<T extends string>(
    config: injectPostCommentsDefaultConfig = {},
    additionalPropsToPostComment: (classes: Record<T, string>) => Partial<PostCommentProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const { needZip } = config
    const PostCommentDefault = React.memo(function PostCommentDefault(
        props: Pick<PostCommentProps, 'needZip' | 'comment'>,
    ) {
        const classes = useCustomStyles()
        const additional = additionalPropsToPostComment(classes)
        return <PostComment {...props} {...additional} />
    })
    return function injectPostComments(current: PostInfo) {
        const selector = current.commentsSelector
        if (!selector) return noop
        const commentWatcher = new MutationObserverWatcher(selector, current.rootNode)
            .useForeach((commentNode, key, meta) => {
                const commentRef = new ValueRef(commentNode.innerText)
                const needZipF =
                    needZip ||
                    (() => {
                        commentNode.style.whiteSpace = 'nowrap'
                        commentNode.style.overflow = 'hidden'
                    })
                const unmount = renderInShadowRoot(
                    <PostInfoContext.Provider value={current}>
                        <PostCommentDefault needZip={needZipF} comment={commentRef} {...current} />
                    </PostInfoContext.Provider>,
                    { normal: () => meta.after, shadow: () => meta.afterShadow },
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
            .setDOMProxyOption({ afterShadowRootInit: { mode: PreferShadowRootMode } })
            .startWatch({
                childList: true,
                subtree: true,
            })

        return () => commentWatcher.stopWatch()
    }
}
