import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        fontSize: 14,
        color: theme.palette.maskColor.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
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

    return (
        <div {...rest}>
            <Typography className={classes.summary}>
                <RSS3Trans.vote
                    values={{
                        user,
                        option,
                        platform: action.platform!,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
        </div>
    )
}
