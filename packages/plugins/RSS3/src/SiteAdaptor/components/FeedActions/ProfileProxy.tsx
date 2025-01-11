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
        whiteSpace: 'pre',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface ProfileProxyActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileLinkFeed
}

/**
 * ProfileProxyAction
 * Including:
 *
 * - ProfileProxy
 */
export function ProfileProxyAction({ feed, ...rest }: ProfileProxyActionProps) {
    const { classes } = useStyles()

    const user = useAddressLabel(feed.owner)

    const platform = feed.platform!
    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <Trans>
                    <Label>{user}</Label> appointed a proxy on <Label>{platform}</Label>
                </Trans>
            </Typography>
        </div>
    )
}
