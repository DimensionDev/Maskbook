import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { Chip } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChipProps } from '@mui/material/Chip'
import Lock from '@mui/icons-material/Lock'
import { useEffect } from 'react'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { decodeArrayBuffer } from '@dimensiondev/kit'

const useStyle = makeStyles()({
    root: {
        height: 'auto',
        width: 'calc(98% - 10px)',
        padding: '6px',
    },
    label: {
        width: '90%',
        overflowWrap: 'break-word',
        whiteSpace: 'normal',
        textOverflow: 'clip',
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
}
export function PostComment(props: PostCommentProps) {
    const { needZip } = props
    const comment = useValueRef(props.comment)
    const postContent = usePostInfoDetails.rawMessagePiped()
    const iv = usePostInfoDetails.iv()

    const dec = useAsync(async () => {
        const decryptedText = extractTextFromTypedMessage(postContent).unwrap()
        if (!iv || !decryptedText) throw new Error('Decrypt comment failed')
        const result = await Services.Crypto.decryptComment(
            new Uint8Array(decodeArrayBuffer(iv)),
            decryptedText,
            comment,
        )
        if (result === null) throw new Error('Decrypt result empty')
        return result
    }, [iv, postContent, comment])

    useEffect(() => void (dec.value && needZip()), [dec.value, needZip])
    if (dec.value) return <PostCommentDecrypted>{dec.value}</PostCommentDecrypted>
    return null
}
