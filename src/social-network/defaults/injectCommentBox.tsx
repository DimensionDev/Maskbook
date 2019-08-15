import React from 'react'
import { PostInfo } from '../ui'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { CommentBox } from '../../components/InjectedComponents/CommentBox'
import Services from '../../extension/service'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { dispatchCustomEvents, selectElementContents, sleep } from '../../utils/utils'

export function injectCommentBoxDefault(
    onPasteToCommentBox: (
        encryptedComment: string,
        current: PostInfo,
    ) => void = async function onPasteToCommentBoxFacebook(encryptedComment, current) {
        const root = current.rootNode
        selectElementContents(root.querySelector('[contenteditable]')!)
        dispatchCustomEvents('paste', encryptedComment)
        await sleep(200)
        if (!root.innerText.includes(encryptedComment))
            prompt('Please paste it into the comment box!', encryptedComment)
    },
) {
    return function injectPostBox(current: PostInfo) {
        if (!current.commentBoxSelector) return;
        const commentBoxWatcher = new MutationObserverWatcher(current.commentBoxSelector, current.rootNode)
            .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .enableSingleMode()
            .startWatch()
        const CommentBoxUI = () => {
            const payload = useValueRef(current.postPayload)
            const decrypted = useValueRef(current.decryptedPostContent)
            return (
                <CommentBox
                    display={!!(payload && decrypted)}
                    onSubmit={async content => {
                        const encryptedComment = await Services.Crypto.encryptComment(payload!.iv, decrypted, content)
                        onPasteToCommentBox(encryptedComment, current)
                    }}
                />
            )
        }
        return renderInShadowRoot(<CommentBoxUI />, commentBoxWatcher.firstVirtualNode.afterShadow)
    }
}
