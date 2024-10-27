import { memo, useCallback, useContext } from 'react'
import { type PostInfo, PostInfoContext, usePostInfoEncryptComment } from '@masknet/plugin-infra/content-script'
import { type DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { MaskMessages } from '@masknet/shared-base'
import { CommentBox, type CommentBoxProps } from '../../../components/InjectedComponents/CommentBox.js'
import { startWatch } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'

async function defaultOnPasteToCommentBox(
    encryptedComment: string,
    _current: PostInfo,
    _realCurrent: HTMLElement | null,
) {
    MaskMessages.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
}

// TODO: should not rely on onPasteToCommentBoxFacebook.
// Use automation.nativeCommentBox.appendText
export const injectCommentBoxDefaultFactory = function <T extends string>(
    onPasteToCommentBox = defaultOnPasteToCommentBox,
    additionPropsToCommentBox: (classes: Record<T, string>) => Partial<CommentBoxProps> = () => ({}),
    useCustomStyles: (props?: any) => {
        classes: Record<T, string>
    } = makeStyles()({}) as any,
    mountPointCallback?: (node: DOMProxy) => void,
) {
    const CommentBoxUI = memo(function CommentBoxUI({ dom }: { dom: HTMLElement | null }) {
        const info = useContext(PostInfoContext)
        const encryptComment = usePostInfoEncryptComment()
        const { classes } = useCustomStyles()
        const props = additionPropsToCommentBox(classes)
        const onCallback = useCallback(
            async (content: string) => {
                if (!encryptComment) return
                const encryptedComment = await encryptComment(content)
                onPasteToCommentBox(encryptedComment, info!, dom)
            },
            [encryptComment, info, dom],
        )

        if (!encryptComment) return null
        return <CommentBox onSubmit={onCallback} {...props} />
    })
    return (signal: AbortSignal, current: PostInfo) => {
        if (!current.comment?.commentBoxSelector) return
        const commentBoxWatcher = new MutationObserverWatcher(
            current.comment.commentBoxSelector.clone(),
            document.body,
        ).useForeach((node, key, meta) => {
            try {
                mountPointCallback?.(meta)
            } catch {}
            const root = attachReactTreeWithContainer(meta.afterShadow, { signal })
            root.render(
                <PostInfoContext value={current}>
                    <CommentBoxUI {...{ ...current, dom: meta.realCurrent }} />
                </PostInfoContext>,
            )
            return root.destroy
        })
        startWatch(commentBoxWatcher, signal)
    }
}
