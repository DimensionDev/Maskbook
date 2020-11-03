import React, { useEffect } from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'
import Services from '../../extension/service'
import type { ValueRef } from '@dimensiondev/holoflows-kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import type { ChipProps } from '@material-ui/core/Chip'
import { useStylesExtends } from '../custom-ui-helper'
import { useAsync } from 'react-use'
import { usePostInfoDetails } from '../DataSource/usePostInfo'

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
            <Chip
                data-testid="comment_field"
                icon={<Lock />}
                label={props.children}
                color="secondary"
                {...props.ChipProps}
                classes={chipClasses}
            />
        </>
    )
}
export interface PostCommentProps {
    comment: ValueRef<string>
    needZip(): void
    successComponentProps?: PostCommentDecryptedProps
    successComponent?: React.ComponentType<PostCommentDecryptedProps>
    waitingComponent?: React.ComponentType
    failedComponent?: React.ComponentType<{ error: Error }>
}
export function PostComment(props: PostCommentProps) {
    const { failedComponent: Fail, waitingComponent: Wait, needZip } = props
    const comment = useValueRef(props.comment)
    const decryptedPostContent = usePostInfoDetails('decryptedPostContentRaw')
    const postPayload = usePostInfoDetails('postPayload')
    const postIV = postPayload.ok ? postPayload.val.iv : ''

    const dec = useAsync(async () => {
        if (!postIV || !decryptedPostContent) throw new Error('Decrypt comment failed')
        const result = await Services.Crypto.decryptComment(postIV, decryptedPostContent, comment)
        if (result === null) throw new Error('Decrypt result empty')
        return result
    }, [postIV, decryptedPostContent, comment])

    const Success = props.successComponent || PostCommentDecrypted
    useEffect(() => void (dec.value && needZip()), [dec.value, needZip])
    if (dec.error) return Fail ? <Fail error={dec.error} /> : null
    if (dec.loading) return Wait ? <Wait /> : null
    if (dec.value) return <Success {...props.successComponentProps}>{dec.value}</Success>
    return null
}
