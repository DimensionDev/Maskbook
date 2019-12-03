import React from 'react'
import { PostInfo } from '../ui'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { CommentBox, CommentBoxProps } from '../../components/InjectedComponents/CommentBox'
import Services from '../../extension/service'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { dispatchCustomEvents, nop, selectElementContents, sleep } from '../../utils/utils'
import { makeStyles } from '@material-ui/core'

const defHandler = async (encryptedComment: string, current: PostInfo, realCurrent: HTMLElement | null) => {
    const root = realCurrent || current.rootNode
    /**
     * TODO:
     *  Yeah I see but I think root.querySelector('[contenteditable]')
     *  (some website may use textarea or input) and
     *  dispatchCustomEvents('paste', encryptedComment)
     *  (not every website are using React and listened from document)
     *  is not a good default.
     */
    selectElementContents(root.querySelector('[contenteditable]')!)
    dispatchCustomEvents('paste', encryptedComment)
    await sleep(200)
    if (!root.innerText.includes(encryptedComment)) prompt('Please paste it into the comment box!', encryptedComment)
}

export const injectCommentBoxDefaultFactory = function<T extends string>(
    onPasteToCommentBox = defHandler,
    additionPropsToCommentBox: (classes: Record<T, string>) => Partial<CommentBoxProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const CommentBoxUI = React.memo(function CommentBoxUI(current: PostInfo & { realCurrent: HTMLElement | null }) {
        const payload = useValueRef(current.postPayload)
        const decrypted = useValueRef(current.decryptedPostContent)
        const styles = useCustomStyles()
        const props = additionPropsToCommentBox(styles)
        const onCallback = React.useCallback(
            async content => {
                const encryptedComment = await Services.Crypto.encryptComment(payload!.iv, decrypted, content)
                onPasteToCommentBox(encryptedComment, current, current.realCurrent).then()
            },
            [current, decrypted, payload],
        )

        if (!(payload && decrypted)) return null
        return <CommentBox onSubmit={onCallback} {...props} />
    })
    return (current: PostInfo) => {
        if (!current.commentBoxSelector) return nop
        const commentBoxWatcher = new MutationObserverWatcher(current.commentBoxSelector.clone(), current.rootNode)
            .useForeach((node, key, meta) =>
                renderInShadowRoot(
                    <CommentBoxUI {...{ ...current, realCurrent: meta.realCurrent }} />,
                    meta.afterShadow,
                ),
            )
            .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .startWatch({
                childList: true,
                subtree: true,
            })
        return () => commentBoxWatcher.stopWatch()
    }
}
