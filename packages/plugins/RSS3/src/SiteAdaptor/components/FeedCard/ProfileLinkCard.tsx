import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { formatDomainName } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { ProfileLinkAction } from '../FeedActions/ProfileLinkAction.js'

const useStyles = makeStyles<void, 'body'>()((theme, _, refs) => ({
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(1.5),
        gap: theme.spacing(2),
    },
    verbose: {
        [`.${refs.body}`]: {
            height: 186,
            justifyContent: 'center',
        },
    },

    user: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
        marginLeft: theme.spacing(1),
    },
    image: {
        height: 32,
        width: 32,
        borderRadius: '50%',
        overflow: 'hidden',
    },
    avatar: {
        height: 32,
        width: 32,
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isProfileLinkFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.ProfileLinkFeed {
    return feed.tag === Tag.Social && [Type.Follow, Type.Unfollow].includes(feed.type)
}

interface ProfileLinkCardProps extends Omit<FeedCardProps, 'feed'> {
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
 * ProfileLinkCard
 * Including:
 *
 * - ProfileLink, aka Follow, Unfollow
 */
export function ProfileLinkCard({ feed, className, ...rest }: ProfileLinkCardProps) {
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const formattedUser = formatDomainName(user, 16, true)
    const otherEns = useAddressLabel(metadata?.address ?? '')
    const other = metadata ? resolveHandle(metadata) : otherEns
    const formattedOther = formatDomainName(other, 16, true)
    const Icon = feed.type === 'follow' ? Icons.Follow : Icons.Unfollow

    return (
        <CardFrame
            type={CardType.ProfileLink}
            feed={feed}
            className={cx(className, rest.verbose ? classes.verbose : null)}
            {...rest}>
            <ProfileLinkAction feed={feed} />
            {metadata ?
                <div className={cx(classes.body)}>
                    <div className={classes.user}>
                        <Image
                            className={classes.avatar}
                            classes={{
                                container: classes.image,
                            }}
                            height={32}
                            width={32}
                            src={`https://cdn.stamp.fyi/avatar/${feed.owner}`}
                        />
                        <Typography className={classes.name} title={user}>
                            {formattedUser}
                        </Typography>
                    </div>
                    <Icon height={18} width={48} />
                    <div className={classes.user}>
                        <Image
                            className={classes.avatar}
                            classes={{
                                container: classes.image,
                            }}
                            src={`https://cdn.stamp.fyi/avatar/${metadata.address}`}
                            height={32}
                            width={32}
                        />
                        <Typography className={classes.name} title={other}>
                            {formattedOther}
                        </Typography>
                    </div>
                </div>
            :   null}
        </CardFrame>
    )
}
