import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel, Label } from '../common.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    summary: {
        fontSize: 14,
        color: theme.palette.maskColor.main,
        textOverflow: 'ellipsis',
        whiteSpace: 'pre',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface VoteActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.VoteFeed
}

/**
 * DonationAction
 * Including:
 *
 * - NoteCreate
 * - NoteEdit
 */
export function VoteAction({ feed, ...rest }: VoteActionProps) {
    const { classes } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const option = useMemo(() => {
        if (!metadata?.choice) return ''
        const { choice, proposal } = metadata
        const choices: number[] = /^\[.*?]$/.test(choice) ? JSON.parse(choice) : [Number.parseInt(choice, 10)]
        return choices.map((no) => proposal.options[no - 1]).join(', ')
    }, [metadata?.choice, metadata?.proposal])

    if (!metadata) return null

    const platform = action.platform!
    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <Trans>
                    <AccountLabel address={feed.owner}>{user}</AccountLabel> voted for <Label>{option}</Label> on{' '}
                    <Label>{platform}</Label>
                </Trans>
            </Typography>
        </div>
    )
}
