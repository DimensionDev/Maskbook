import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
}))

interface ProposeActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProposeFeed
}

/**
 * ProposeAction
 * Including:
 *
 * - NoteCreate
 * - NoteEdit
 */
export function ProposeAction({ feed, ...rest }: ProposeActionProps) {
    const { classes } = useStyles()
    const user = useAddressLabel(feed.owner)

    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <Trans>
                    <Label>{user}</Label> proposed
                </Trans>
            </Typography>
        </div>
    )
}
