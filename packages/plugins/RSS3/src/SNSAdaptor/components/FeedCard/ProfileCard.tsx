import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { Translate } from '../../../locales/i18n_generated'
import { useAddressLabel } from '../../hooks'
import { CardType } from '../share'
import { CardFrame, FeedCardProps } from '../base'
import { Label } from './common'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'info' | 'center'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
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

interface CollectibleCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileFeed
}

/**
 * ProfileCard
 * Including:
 *
 * - ProfileCreate
 */
export const ProfileCard: FC<CollectibleCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const user = useAddressLabel(feed.owner)

    const action = feed.actions[0]
    const metadata = action.metadata

    const imageSize = verbose ? '100%' : 64

    return (
        <CardFrame type={CardType.ProfileCreate} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.profile
                    values={{
                        user,
                        platform: metadata?.platform!,
                        context: metadata?.type!,
                    }}
                    components={{
                        user: <Label />,
                        platform: <Label />,
                    }}
                />
            </Typography>
            {metadata ? (
                <div
                    className={cx(classes.body, {
                        [classes.verbose]: verbose,
                        [classes.center]: !metadata.bio && !verbose,
                    })}>
                    <Image
                        classes={{ container: classes.image }}
                        src={metadata.profile_uri[0]}
                        height={imageSize}
                        width={imageSize}
                    />
                    <div className={classes.info}>
                        <Typography className={classes.title}>{metadata.name || metadata.handle}</Typography>
                        {metadata.bio ? <Typography className={classes.bio}>{metadata.bio}</Typography> : null}
                    </div>
                </div>
            ) : null}
        </CardFrame>
    )
}
