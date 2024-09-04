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
        whiteSpace: 'pre',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface ProfileActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileFeed
}

/**
 * ProfileAction
 * Including:
 *
 * - ProfileCreate
 */
export function ProfileAction({ feed, ...rest }: ProfileActionProps) {
    const { classes } = useStyles()

    const user = useAddressLabel(feed.owner)

    const action = feed.actions[0]
    const metadata = action.metadata

    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                {/* eslint-disable-next-line react/naming-convention/component-name */}
                <RSS3Trans.profile
                    values={{
                        user,
                        platform: metadata?.platform ?? 'Unknown platform',
                        context: metadata?.action,
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
