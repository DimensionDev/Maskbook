import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { type FeedCardProps } from '../base.js'
import { useAddressLabel } from '../../hooks/index.js'
import { Label } from '../common.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
}))

interface TokenFeedActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.Web3Feed
}

export function UnknownAction({ feed, ...rest }: TokenFeedActionProps) {
    const { classes } = useStyles()

    const user = useAddressLabel(feed.owner)
    const target = useAddressLabel(feed.to)

    const platform = feed.platform!
    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <Trans>
                    <Label>{user}</Label> carried out an activity to <Label>{target}</Label> on{' '}
                    <Label>{platform}</Label>
                </Trans>
            </Typography>
        </div>
    )
}
