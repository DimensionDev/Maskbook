import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { Chip } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChipProps } from '@mui/material/Chip'
import Lock from '@mui/icons-material/Lock'
import { useEffect } from 'react'
import { useAsync } from 'react-use'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'

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
    const decrypt = usePostInfoDetails.decryptComment()

    const { value } = useAsync(async () => decrypt?.(comment), [decrypt, comment])

    useEffect(() => void (value && needZip()), [value, needZip])
    if (value) return <PostCommentDecrypted>{value}</PostCommentDecrypted>
    return null
}
