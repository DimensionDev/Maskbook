import { memo, useCallback } from 'react'
import type { PostInfo } from '../../PostInfo'
import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { CommentBox, CommentBoxProps } from '../../../components/InjectedComponents/CommentBox'
import Services from '../../../extension/service'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { makeStyles } from '@masknet/theme'
import { usePostInfoDetails, usePostInfo, PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-unified'
import { MaskMessages } from '../../../utils/messages'
import { startWatch } from '../../../utils/watcher'
import { extractTextFromTypedMessage } from '@masknet/typed-message'

const defaultOnPasteToCommentBox = async (
    encryptedComment: string,
    _current: PostInfo,
    _realCurrent: HTMLElement | null,
) => {
    MaskMessages.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
}

// TODO: should not rely on onPasteToCommentBoxFacebook.
// Use automation.nativeCommentBox.appendText
export const injectCommentBoxDefaultFactory = function <T extends string>(
    onPasteToCommentBox = defaultOnPasteToCommentBox,
    additionPropsToCommentBox: (classes: Record<T, string>) => Partial<CommentBoxProps> = () => ({}),
    useCustomStyles: (props?: any) => { classes: Record<T, string> } = makeStyles()({}) as any,
    mountPointCallback?: (node: DOMProxy<HTMLElement, HTMLSpanElement, HTMLSpanElement>) => void,
) {
    const CommentBoxUI = memo(function CommentBoxUI({ dom }: { dom: HTMLElement | null }) {
        const info = usePostInfo()
        const postContent = usePostInfoDetails.rawMessagePiped()
        const { classes } = useCustomStyles()
        const iv = usePostInfoDetails.iv()
        const props = additionPropsToCommentBox(classes)
        const onCallback = useCallback(
            async (content) => {
                const decryptedText = extractTextFromTypedMessage(postContent).unwrap()
                const encryptedComment = await Services.Crypto.encryptComment(iv!, decryptedText, content)
                onPasteToCommentBox(encryptedComment, info!, dom).catch(console.error)
            },
            [postContent, info, dom, iv],
        )

        if (!iv) return null
        if (!postContent.items.length) return null
        return <CommentBox onSubmit={onCallback} {...props} />
    })
    return (signal: AbortSignal, current: PostInfo) => {
        if (!current.comment?.commentBoxSelector) return noop
        const commentBoxWatcher = new MutationObserverWatcher(
            current.comment.commentBoxSelector.clone(),
            document.body,
        ).useForeach((node, key, meta) => {
            try {
                mountPointCallback?.(meta)
            } catch {}
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
