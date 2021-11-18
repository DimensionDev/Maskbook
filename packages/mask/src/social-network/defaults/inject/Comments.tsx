import { memo } from 'react'
import type { PostInfo } from '../../PostInfo'
import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostComment, PostCommentProps } from '../../../components/InjectedComponents/PostComments'
import { makeStyles } from '@masknet/theme'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-es'
import { collectNodeText } from '../../../utils'
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
    useCustomStyles: (props?: any) => { classes: Record<T, string> } = makeStyles()({}) as any,
) {
    const { needZip } = config
    const PostCommentDefault = memo(function PostCommentDefault(props: Pick<PostCommentProps, 'needZip' | 'comment'>) {
        const { classes } = useCustomStyles()
        const additional = additionalPropsToPostComment(classes)
        return <PostComment {...props} {...additional} />
    })
    return function injectPostComments(signal: AbortSignal, current: PostInfo) {
        const selector = current.comment?.commentsSelector
        if (!selector) return noop
        const commentWatcher = new MutationObserverWatcher(selector, document.body).useForeach(
            (commentNode, key, meta) => {
                const commentRef = new ValueRef(collectNodeText(commentNode))
                const needZipF = needZip || (() => undefined)
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
