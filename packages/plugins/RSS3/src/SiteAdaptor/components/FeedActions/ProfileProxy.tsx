import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
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

    return (
        <div {...rest}>
            <Typography className={classes.summary}>
                <RSS3Trans.profile_proxy
                    values={{
                        user,
                        platform: feed.platform!,
                    }}
                    components={{
                        user: <Label />,
                        platform: <Label />,
                    }}
                />
            </Typography>
        </div>
    )
}
