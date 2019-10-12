import React from 'react'
import { PostInfo } from '../ui'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { CommentBox } from '../../components/InjectedComponents/CommentBox'
import Services from '../../extension/service'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { dispatchCustomEvents, nop, selectElementContents, sleep } from '../../utils/utils'

const defHandler = async (encryptedComment: string, current: PostInfo) => {
    const root = current.rootNode
    /**
     * TODO:
     *  Yeah I see but I think root.querySelector('[contenteditable]')
     *  (some website may use textarea or input) and
     *  dispatchCustomEvents('paste', encryptedComment)
     *  (not every website are using React and listenen from document)
     *  is not a good default.
     */
    selectElementContents(root.querySelector('[contenteditable]')!)
    dispatchCustomEvents('paste', encryptedComment)
    await sleep(200)
    if (!root.innerText.includes(encryptedComment)) prompt('Please paste it into the comment box!', encryptedComment)
}

export const injectCommentBoxDefaultFactory = (onPasteToCommentBox = defHandler) => {
    return (current: PostInfo) => {
        if (!current.commentBoxSelector) return nop
        const commentBoxWatcher = new MutationObserverWatcher(
            current.commentBoxSelector.clone().enableSingleMode(),
            current.rootNode,
        )
            .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .startWatch({
                childList: true,
                subtree: true,
            })
        const CommentBoxUI = () => {
            const payload = useValueRef(current.postPayload)
            const decrypted = useValueRef(current.decryptedPostContent)
            if (!(payload && decrypted)) return null
            return (
                <CommentBox
                    onSubmit={async content => {
                        const encryptedComment = await Services.Crypto.encryptComment(payload!.iv, decrypted, content)
                        onPasteToCommentBox(encryptedComment, current).then()
                    }}
                />
            )
        }
        return renderInShadowRoot(<CommentBoxUI />, commentBoxWatcher.firstDOMProxy.afterShadow)
    }
}
