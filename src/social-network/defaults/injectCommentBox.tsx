import React from 'react'
import { PostInfo } from '../ui'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { CommentBox } from '../../components/InjectedComponents/CommentBox'
import Services from '../../extension/service'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'

export function injectCommentBoxDefault(onPasteToCommentBox: (encryptedComment: string, current: PostInfo) => void) {
    return function injectPostBox(current: PostInfo) {
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
