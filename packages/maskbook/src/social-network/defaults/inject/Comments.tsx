import { memo } from 'react'
import type { PostInfo } from '../../PostInfo'
import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostComment, PostCommentProps } from '../../../components/InjectedComponents/PostComments'
import { makeStyles } from '@material-ui/core'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-es'
import { collectNodeText } from '../../../social-network-adaptor/facebook.com/collecting/posts'
import { startWatch } from '../../../utils/watcher'

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
    const PostCommentDefault = memo(function PostCommentDefault(props: Pick<PostCommentProps, 'needZip' | 'comment'>) {
        const classes = useCustomStyles()
        const additional = additionalPropsToPostComment(classes)
        return <PostComment {...props} {...additional} />
    })
    return function injectPostComments(signal: AbortSignal, current: PostInfo) {
        const selector = current.commentsSelector
        if (!selector) return noop
        const commentWatcher = new MutationObserverWatcher(selector, current.rootNode || void 0).useForeach(
            (commentNode, key, meta) => {
                const commentRef = new ValueRef(collectNodeText(commentNode))
                const needZipF =
                    needZip ||
                    (() => {
                        commentNode.style.whiteSpace = 'nowrap'
                        commentNode.style.overflow = 'hidden'
                    })
                const root = createReactRootShadowed(meta.afterShadow, { signal })
                root.render(
                    <PostInfoProvider post={current}>
                        <PostCommentDefault needZip={needZipF} comment={commentRef} />
                    </PostInfoProvider>,
                )
                return {
                    onNodeMutation() {
                        commentRef.value = collectNodeText(commentNode)
                    },
                    onTargetChanged() {
                        commentRef.value = collectNodeText(commentNode)
                    },
                    onRemove() {
                        root.destory()
                    },
                }
            },
        )
        startWatch(commentWatcher, signal)

        return () => commentWatcher.stopWatch()
    }
}
