import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { Label } from './common.js'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles<void, 'body'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
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
export function isProfileLinkFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.ProfileLinkFeed {
    return feed.tag === Tag.Social && [Type.Follow, Type.Unfollow].includes(feed.type)
}

interface CollectibleCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProfileLinkFeed
}

const suffixMap: Record<string, string> = {
    crossbell: '.csb',
}
const resolveHandle = (metadata?: RSS3BaseAPI.FollowMetadata) => {
    if (!metadata) return ''
    return `${metadata.handle}${suffixMap[metadata.source]}`.toLowerCase()
}

/**
 * ProfileLinkCard
 * Including:
 *
 * - ProfileLink, aka Follow, Unfollow
 */
export const ProfileLinkCard: FC<CollectibleCardProps> = ({ feed, className, ...rest }) => {
    const { classes, cx } = useStyles()

    const user = useAddressLabel(feed.owner)

    const action = feed.actions[0]
    const metadata = action.metadata

    return (
        <CardFrame
            type={CardType.ProfileLink}
            feed={feed}
            className={cx(className, rest.verbose ? classes.verbose : null)}
            {...rest}>
            <Typography className={classes.summary}>
                <Translate.profile_link
                    values={{
                        user,
                        other: resolveHandle(metadata),
                        platform: feed.platform!,
                        context: feed.type,
                    }}
                    components={{
                        user: <Label />,
                        other: <Label />,
                        platform: <Label />,
                    }}
                />
            </Typography>
            {metadata ? (
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
                    <Icons.RSS3ProfileLink height={18} width="auto" />
                    <div className={classes.user}>
                        <Image
                            className={classes.avatar}
                            classes={{
                                container: classes.image,
                            }}
                            height={32}
                            width={32}
                            src={`https://cdn.stamp.fyi/avatar/${metadata.address}`}
                        />
                        <Typography className={classes.name}>{resolveHandle(metadata)}</Typography>
                    </div>
                </div>
            ) : null}
        </CardFrame>
    )
}
