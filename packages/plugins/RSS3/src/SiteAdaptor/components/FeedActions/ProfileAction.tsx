import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'
import { Select, Trans } from '@lingui/react/macro'

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

    const platform = metadata?.platform ?? 'Unknown platform'
    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <Select
                    _create={
                        <Trans>
                            <Label>{user}</Label> created a profile on <Label>{platform}</Label>
                        </Trans>
                    }
                    _update={
                        <Trans>
                            <Label>{user}</Label> updated a profile on <Label>{platform}</Label>
                        </Trans>
                    }
                    value={metadata?.action}
                />
            </Typography>
        </div>
    )
}
