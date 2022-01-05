import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import { Chip } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChipProps } from '@mui/material/Chip'
import Lock from '@mui/icons-material/Lock'
import { useEffect } from 'react'
import { useAsync } from 'react-use'
import { usePostInfo } from '../DataSource/usePostInfo'

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
    const { decryptPostComment } = usePostInfo()!

    const dec = useAsync(async () => {
        const result = await decryptPostComment(comment)
        if (result === null) throw new Error('Decrypt result empty')
        return result
    }, [comment])

    useEffect(() => void (dec.value && needZip()), [dec.value, needZip])
    if (dec.value) return <PostCommentDecrypted>{dec.value}</PostCommentDecrypted>
    return null
}
