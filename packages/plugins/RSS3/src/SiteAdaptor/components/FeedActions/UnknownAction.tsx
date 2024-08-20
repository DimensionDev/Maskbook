import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { type FeedCardProps } from '../base.js'
import { RSS3Trans } from '../../../locales/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { Label } from '../common.js'

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
    const targetUser = useAddressLabel(feed.to)

    return (
        <div {...rest}>
            <Typography className={classes.summary}>
                <RSS3Trans.carry_out_activity
                    values={{
                        user,
                        target: targetUser,
                        platform: feed.platform!,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
        </div>
    )
}
