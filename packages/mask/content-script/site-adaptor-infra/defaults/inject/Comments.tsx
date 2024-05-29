import { memo } from 'react'
import { type PostInfo, PostInfoContext } from '@masknet/plugin-infra/content-script'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { ValueRef } from '@masknet/shared-base'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { PostComment, type PostCommentProps } from '../../../components/InjectedComponents/PostComments.js'
import { collectNodeText } from '../../../utils/index.js'

interface injectPostCommentsDefaultConfig {
    needZip?(): void
}
/**
 * Create a default implementation of injectPostComments
 */
export function injectPostCommentsDefault<T extends string>(
    config: injectPostCommentsDefaultConfig = {},
    additionalPropsToPostComment: (classes: Record<T, string>) => Partial<PostCommentProps> = () => ({}),
    useCustomStyles: (props?: any) => {
        classes: Record<T, string>
    } = makeStyles()({}) as any,
) {
    const { needZip } = config
    const PostCommentDefault = memo(function PostCommentDefault(props: Pick<PostCommentProps, 'needZip' | 'comment'>) {
        const { classes } = useCustomStyles()
        const additional = additionalPropsToPostComment(classes)
        return <PostComment {...props} {...additional} />
    })
    return function injectPostComments(signal: AbortSignal, current: PostInfo) {
        const selector = current.comment?.commentsSelector
        if (!selector) return
        const commentWatcher = new MutationObserverWatcher(selector, document.body).useForeach(
            (commentNode, key, meta) => {
                const commentRef = new ValueRef(collectNodeText(commentNode))
                const needZipF = needZip || (() => undefined)
                const root = attachReactTreeWithContainer(meta.afterShadow, { signal })
                root.render(
                    <PostInfoContext value={current}>
                        <PostCommentDefault needZip={needZipF} comment={commentRef} />
                    </PostInfoContext>,
                )
                return {
                    onNodeMutation() {
                        commentRef.value = collectNodeText(commentNode)
                    },
                    onTargetChanged() {
                        commentRef.value = collectNodeText(commentNode)
                    },
                    onRemove() {
                        root.destroy()
                    },
                }
            },
        )
        startWatch(commentWatcher, signal)
    }
}
