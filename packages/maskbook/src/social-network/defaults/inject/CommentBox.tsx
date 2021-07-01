import { memo, useCallback } from 'react'
import type { PostInfo } from '../../PostInfo'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { CommentBox, CommentBoxProps } from '../../../components/InjectedComponents/CommentBox'
import Services from '../../../extension/service'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { makeStyles } from '@material-ui/core'
import { usePostInfoDetails, usePostInfo, PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-es'
import { MaskMessage } from '../../../utils/messages'
import { startWatch } from '../../../utils/watcher'
import { extractTextFromTypedMessage } from '../../../protocols/typed-message'

const defaultOnPasteToCommentBox = async (
    encryptedComment: string,
    _current: PostInfo,
    _realCurrent: HTMLElement | null,
) => {
    MaskMessage.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
}

// TODO: should not rely on onPasteToCommentBoxFacebook.
// Use automation.nativeCommentBox.appendText
export const injectCommentBoxDefaultFactory = function <T extends string>(
    onPasteToCommentBox = defaultOnPasteToCommentBox,
    additionPropsToCommentBox: (classes: Record<T, string>) => Partial<CommentBoxProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const CommentBoxUI = memo(function CommentBoxUI({ dom }: { dom: HTMLElement | null }) {
        const info = usePostInfo()
        const payload = usePostInfoDetails.postPayload()
        const postContent = usePostInfoDetails.transformedPostContent()
        const styles = useCustomStyles()
        const iv = usePostInfoDetails.iv()
        const props = additionPropsToCommentBox(styles)
        const onCallback = useCallback(
            async (content) => {
                const postIV = iv || payload.unwrap().iv
                const decryptedText = extractTextFromTypedMessage(postContent).unwrap()
                const encryptedComment = await Services.Crypto.encryptComment(postIV, decryptedText, content)
                onPasteToCommentBox(encryptedComment, info!, dom).catch(console.error)
            },
            [payload, postContent, info, dom, iv],
        )

        if (!(payload && postContent)) return null
        return <CommentBox onSubmit={onCallback} {...props} />
    })
    return (signal: AbortSignal, current: PostInfo) => {
        if (!current.commentBoxSelector) return noop
        const commentBoxWatcher = new MutationObserverWatcher(
            current.commentBoxSelector.clone(),
            current.rootNode || void 0,
        ).useForeach((node, key, meta) => {
            const root = createReactRootShadowed(meta.afterShadow, { signal })
            root.render(
                <PostInfoProvider post={current}>
                    <CommentBoxUI {...{ ...current, dom: meta.realCurrent }} />
                </PostInfoProvider>,
            )
            return root.destory
        })
        startWatch(commentBoxWatcher, signal)
        return () => commentBoxWatcher.stopWatch()
    }
}
