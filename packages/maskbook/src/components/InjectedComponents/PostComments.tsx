import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef, useStylesExtends } from '@masknet/shared'
import { Chip } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { ChipProps } from '@mui/material/Chip'
import Lock from '@mui/icons-material/Lock'
import { useEffect } from 'react'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../DataSource/usePostInfo'

const useStyle = makeStyles()({
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
    const postContent = usePostInfoDetails.transformedPostContent()
    const postPayload = usePostInfoDetails.postPayload()
    const iv = usePostInfoDetails.iv()
    const postIV = postPayload.map((x) => x.iv).unwrapOr(iv)

    const dec = useAsync(async () => {
        const decryptedText = extractTextFromTypedMessage(postContent).unwrap()
        if (!postIV || !decryptedText) throw new Error('Decrypt comment failed')
        const result = await Services.Crypto.decryptComment(postIV, decryptedText, comment)
        if (result === null) throw new Error('Decrypt result empty')
        return result
    }, [postIV, postContent, comment])

    const Success = props.successComponent || PostCommentDecrypted
    useEffect(() => void (dec.value && needZip()), [dec.value, needZip])
    if (dec.error) return Fail ? <Fail error={dec.error} /> : null
    if (dec.loading) return Wait ? <Wait /> : null
    if (dec.value) return <Success {...props.successComponentProps}>{dec.value}</Success>
    return null
}
