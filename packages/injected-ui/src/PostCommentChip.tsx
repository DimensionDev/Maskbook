import type { PropsWithChildren } from 'react'
import { Chip, type ChipProps } from '@mui/material'
import { Lock } from '@mui/icons-material'
import { makeStyles } from '@masknet/theme'

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

export interface PostCommentChipProps extends PropsWithChildren {
    ChipProps?: ChipProps
}

/**
 * The decrypted-comment chip shown under a post once Mask decrypts an encrypted comment.
 * See packages/mask/content-script/components/InjectedComponents/PostComments.tsx, which owns
 * the actual decryption (usePostInfoDecryptComment) and only renders this once it resolves.
 */
export function PostCommentChip(props: PostCommentChipProps) {
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
