import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { formatDomainName } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.third,
        fontSize: 14,
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

interface ProfileLinkActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileLinkFeed
}

const suffixMap: Record<string, string> = {
    Crossbell: '.csb',
    Lens: '.lens',
    ENS: '.eth',
}
const resolveHandle = (metadata: RSS3BaseAPI.FollowMetadata) => {
    if (!metadata.handle) return ''
    const handle = metadata.handle.toLowerCase()
    const suffix = (metadata.platform && suffixMap[metadata.platform]) || ''
    // handle might contain suffix at this time.
    return handle.endsWith(suffix) ? handle : `${handle}${suffix}`
}

/**
 * ProfileLinkAction
 * Including:
 *
 * - ProfileLink, aka Follow, Unfollow
 */
export function ProfileLinkAction({ feed, ...rest }: ProfileLinkActionProps) {
    const { classes } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const formattedUser = formatDomainName(user, 16, true)
    const otherEns = useAddressLabel(metadata?.address ?? '')
    const other = metadata ? resolveHandle(metadata) : otherEns
    const formattedOther = formatDomainName(other, 16, true)

    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                {/* eslint-disable-next-line react/naming-convention/component-name */}
                <RSS3Trans.profile_link
                    values={{
                        user: formattedUser,
                        other: formattedOther,
                        platform: feed.platform!,
                        context: feed.type,
                    }}
                    components={{
                        user: <Label title={user} fontSize={14} />,
                        other: <Label title={other} fontSize={14} />,
                        platform: <Label fontSize={14} />,
                    }}
                />
            </Typography>
        </div>
    )
}
