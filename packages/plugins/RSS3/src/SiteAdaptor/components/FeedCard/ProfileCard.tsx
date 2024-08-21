import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { CardFrame, type FeedCardProps } from '../base.js'
import { ProfileAction } from '../FeedActions/ProfileAction.js'
import { CardType } from '../share.js'
import { LensAvatar } from './LensAvatar.js'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'info' | 'center'>()((theme, _, refs) => ({
    verbose: {},
    image: {},
    center: {},
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: theme.spacing(1.5),
        [`&.${refs.center}`]: {
            alignItems: 'center',
        },
        [`&.${refs.verbose}`]: {
            display: 'block',
            [`.${refs.image}`]: {
                width: 552,
            },
            [`.${refs.info}`]: {
                marginLeft: 0,
                marginTop: theme.spacing(1.5),
            },
        },
        [`.${refs.image}`]: {
            width: 64,
            aspectRatio: '1 / 1',
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        },
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        marginLeft: theme.spacing(1.5),
    },
    title: {
        fontWeight: 700,
    },
    bio: {
        fontWeight: 400,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isProfileFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.ProfileFeed {
    return feed.tag === Tag.Social && feed.type === Type.Profile
}

interface ProfileCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileFeed
}

/**
 * ProfileCard
 * Including:
 *
 * - ProfileCreate
 */
export function ProfileCard({ feed, ...rest }: ProfileCardProps) {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const imageSize = verbose ? '100%' : 64

    return (
        <CardFrame
            type={metadata?.action === 'update' ? CardType.ProfileUpdate : CardType.ProfileCreate}
            feed={feed}
            {...rest}>
            <ProfileAction feed={feed} />
            {metadata ?
                <div
                    className={cx(classes.body, {
                        [classes.verbose]: verbose,
                        [classes.center]: !metadata.bio && !verbose,
                    })}>
                    {metadata.source === 'Lens' ?
                        <LensAvatar handle={metadata.handle} size={imageSize} />
                    : metadata.profile_uri ?
                        <Image
                            classes={{ container: classes.image }}
                            src={resolveResourceURL(metadata.profile_uri[0])}
                            height={imageSize}
                            width={imageSize}
                        />
                    :   null}
                    <div className={classes.info}>
                        <Typography className={classes.title}>{metadata.name || metadata.handle}</Typography>
                        {metadata.bio ?
                            <Typography className={classes.bio}>{metadata.bio}</Typography>
                        :   null}
                    </div>
                </div>
            :   null}
        </CardFrame>
    )
}
