import { useEffect } from 'react'
import { useAsync } from 'react-use'
import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import { Lock } from '@mui/icons-material'
import type { ValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { usePostInfoDecryptComment } from '@masknet/plugin-infra/content-script'

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
type PostCommentDecryptedProps = React.PropsWithChildren<{ ChipProps?: ChipProps }>
function PostCommentDecrypted(props: PostCommentDecryptedProps) {
    const { classes } = useStyle(undefined, { props: props.ChipProps || {} })
    return (
        <Chip
            data-testid="comment_field"
            icon={<Lock />}
            label={props.children}
            color="secondary"
            {...props.ChipProps}
            classes={{ root: classes.root, label: classes.label }}
        />
    )
}
export interface PostCommentProps {
    comment: ValueRef<string>
    needZip(): void
}
export function PostComment(props: PostCommentProps) {
    const { needZip } = props
    const comment = useValueRef(props.comment)
    const decrypt = usePostInfoDecryptComment()

    const { value } = useAsync(async () => decrypt?.(comment), [decrypt, comment])

    useEffect(() => void (value && needZip()), [value, needZip])
    if (value) return <PostCommentDecrypted>{value}</PostCommentDecrypted>
    return null
}
