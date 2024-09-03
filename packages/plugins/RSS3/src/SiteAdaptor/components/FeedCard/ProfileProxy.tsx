import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { ProfileProxyAction } from '../FeedActions/ProfileProxy.js'

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
export function isProfileProxyFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.ProfileLinkFeed {
    return feed.tag === Tag.Social && feed.type === Type.Proxy
}

interface ProfileProxyCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileLinkFeed
}

/**
 * ProfileProxyCard
 * Including:
 *
 * - ProfileProxy
 */
export function ProfileProxyCard({ feed, className, ...rest }: ProfileProxyCardProps) {
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)

    return (
        <CardFrame
            type={CardType.ProfileProxy}
            feed={feed}
            className={cx(className, rest.verbose ? classes.verbose : null)}
            {...rest}>
            <ProfileProxyAction feed={feed} />
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
                        <Typography className={classes.name}>{user}</Typography>
                    </div>
                    <Icons.Follow height={18} width={48} />
                </div>
            :   null}
        </CardFrame>
    )
}
