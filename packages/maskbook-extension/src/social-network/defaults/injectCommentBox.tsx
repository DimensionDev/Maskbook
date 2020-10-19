import React from 'react'
import type { PostInfo } from '../PostInfo'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit/es'
import { CommentBox, CommentBoxProps } from '../../components/InjectedComponents/CommentBox'
import Services from '../../extension/service'
import { renderInShadowRoot } from '../../utils/shadow-root/renderInShadowRoot'
import { makeStyles } from '@material-ui/core'
import { PostInfoContext, usePostInfoDetails, usePostInfo } from '../../components/DataSource/usePostInfo'
import { Flags } from '../../utils/flags'
import { noop } from 'lodash-es'
import { MessageCenter } from '../../utils/messages'

const defaultOnPasteToCommentBox = async (
    encryptedComment: string,
    _current: PostInfo,
    _realCurrent: HTMLElement | null,
) => {
    MessageCenter.emit('autoPasteFailed', { text: encryptedComment })
}

export const injectCommentBoxDefaultFactory = function <T extends string>(
    onPasteToCommentBox = defaultOnPasteToCommentBox,
    additionPropsToCommentBox: (classes: Record<T, string>) => Partial<CommentBoxProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const CommentBoxUI = React.memo(function CommentBoxUI({ dom }: { dom: HTMLElement | null }) {
        const info = usePostInfo()
        const payload = usePostInfoDetails('postPayload')
        const decrypted = usePostInfoDetails('decryptedPostContentRaw')
        const styles = useCustomStyles()
        const props = additionPropsToCommentBox(styles)
        const onCallback = React.useCallback(
            async (content) => {
                const encryptedComment = await Services.Crypto.encryptComment(payload.unwrap().iv, decrypted, content)
                onPasteToCommentBox(encryptedComment, info, dom).catch(console.error)
            },
            [payload, decrypted, info, dom],
        )

        if (!(payload && decrypted)) return null
        return <CommentBox onSubmit={onCallback} {...props} />
    })
    return (current: PostInfo) => {
        if (!current.commentBoxSelector) return noop
        const commentBoxWatcher = new MutationObserverWatcher(current.commentBoxSelector.clone(), current.rootNode)
            .useForeach((node, key, meta) =>
                renderInShadowRoot(
                    <PostInfoContext.Provider value={current}>
                        <CommentBoxUI {...{ ...current, dom: meta.realCurrent }} />
                    </PostInfoContext.Provider>,
                    {
                        shadow: () => meta.afterShadow,
                        normal: () => meta.after,
                    },
                ),
            )
            .setDOMProxyOption({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
            .startWatch({
                childList: true,
                subtree: true,
            })
        return () => commentBoxWatcher.stopWatch()
    }
}
