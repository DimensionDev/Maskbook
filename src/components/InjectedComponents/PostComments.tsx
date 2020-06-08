import React, { useEffect } from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'
import Services from '../../extension/service'
import type { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import type { ChipProps } from '@material-ui/core/Chip'
import { useStylesExtends } from '../custom-ui-helper'
import { useAsync } from 'react-use'
import type { PostInfo } from '../../social-network/ui'

const useStyle = makeStyles({
    root: {
        height: 'auto',
        padding: '6px',
    },
    label: {
        whiteSpace: 'initial',
    },
})
export type PostCommentDecryptedProps = React.PropsWithChildren<{ ChipProps?: ChipProps }>
export function PostCommentDecrypted(props: PostCommentDecryptedProps) {
    const chipClasses = useStylesExtends(useStyle(), props.ChipProps || {})
    return (
        <>
            <Chip icon={<Lock />} label={props.children} color="secondary" {...props.ChipProps} classes={chipClasses} />
        </>
    )
}
export interface PostCommentProps {
    decryptedPostContentRaw: ValueRef<string>
    postPayload: PostInfo['postPayload']
    comment: ValueRef<string>
    needZip(): void
    successComponentProps?: PostCommentDecryptedProps
    successComponent?: React.ComponentType<PostCommentDecryptedProps>
    waitingComponent?: React.ComponentType
    failedComponent?: React.ComponentType<{ error: Error }>
}
export function PostComment(props: PostCommentProps) {
    const decryptedPostContent = useValueRef(props.decryptedPostContentRaw)
    const comment = useValueRef(props.comment)
    const postPayload = useValueRef(props.postPayload)
    const postIV = postPayload.ok ? postPayload.val.iv : ''

    const dec = useAsync(async () => {
        if (!postIV || !decryptedPostContent) throw new Error('Decrypt comment failed')
        const result = await Services.Crypto.decryptComment(postIV, decryptedPostContent, comment)
        if (result === null) throw new Error('Decrypt result empty')
        return result
    }, [postIV, decryptedPostContent, comment])

    const Success = props.successComponent || PostCommentDecrypted
    const { failedComponent: Fail, waitingComponent: Wait, needZip } = props
    useEffect(() => void (dec.value && needZip()), [dec.value, needZip])
    if (dec.error) return Fail ? <Fail error={dec.error} /> : null
    if (dec.loading) return Wait ? <Wait /> : null
    if (dec.value) return <Success {...props.successComponentProps}>{dec.value}</Success>
    return null
}
