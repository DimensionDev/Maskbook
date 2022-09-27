import { memo, useMemo } from 'react'
import { Image, AssetPreviewer, ReversedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { useCurrentWeb3NetworkPluginID, useZeroAddress } from '@masknet/plugin-infra/web3'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, BoxProps, Card, Typography } from '@mui/material'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useI18N } from '../../locales/index.js'
import type { RSS3Feed } from '../../types.js'
import { useNormalizeFeed } from '../hooks/index.js'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 16,
        cursor: 'pointer',
    },
    img: {
        width: '64px !important',
        height: '64px !important',
        borderRadius: '8px',
        objectFit: 'cover',
    },
    collection: {
        borderLeft: `4px solid ${theme.palette.maskColor.line}`,
        paddingLeft: 12,
        marginTop: 12,
        marginLeft: 8,
    },
    time: {
        color: theme.palette.maskColor.third,
        marginLeft: 10,
    },

    summary: {
        textOverflow: 'ellipsis',
        maxWidth: '400px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: theme.palette.maskColor.main,
    },
    defaultImage: {
        background: theme.palette.maskColor.modalTitleBg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 64,
        height: 64,
    },
    texts: {
        overflow: 'auto',
        flexGrow: 1,
    },
    media: {
        marginLeft: theme.spacing(1),
        width: 64,
        height: 64,
        flexShrink: 0,
    },
    action: {
        color: theme.palette.maskColor.main,
    },
}))

const { Tag, Type, MaskNetworkMap } = RSS3BaseAPI

export interface FeedCardProps extends Omit<BoxProps, 'onSelect'> {
    feed: RSS3BaseAPI.Activity
    address?: string
    onSelect: (feed: RSS3Feed) => void
}

export const FeedCard = memo(({ feed, address, onSelect, className, ...rest }: FeedCardProps) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const ZERO_ADDRESS = useZeroAddress()

    const action = feed.actions[0]
    const feedAction = useMemo(() => {
        if (!feed) return
        if (feed.tag === Tag.Collectible) {
            if (feed.type === Type.Transfer) {
                return (
                    <span>
                        {`${t.sent_an_NFT_to()} `}
                        {action.address_to ? (
                            <ReversedAddress TypographyProps={{ display: 'inline' }} address={action.address_to} />
                        ) : null}
                    </span>
                )
            }
            if (feed.type === Type.Mint) return t.minted_an_NFT()
            if (feed.type === Type.Trade && isSameAddress(action.address_to, address)) {
                return (
                    <span>
                        {`${t.acquired_an_NFT_from()} `}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={action.address_from ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
        }
        if (feed.tag === Tag.Transaction && feed.type === Type.Transfer) {
            if (isSameAddress(action.address_from, address)) {
                return (
                    <span>
                        {`${t.sent_to()} `}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={action.address_to ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
            if (isSameAddress(action.address_from, address)) {
                return (
                    <span>
                        {`${t.received_from()} `}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={action.address_from ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
        }
        if (feed.type === Type.Donate) {
            if (isSameAddress(action.address_from, address)) {
                return t.donated()
            }
            if (isSameAddress(action.address_to, address)) {
                return t.received_donation_from()
            }
        }
        return isSameAddress(action.address_to, address) ? t.received() : t.sent()
    }, [address, feed, action, t])

    const logo = useMemo(() => {
        if (feed.tag === Tag.Collectible) {
            const action = feed.actions[0] as RSS3BaseAPI.ActionGeneric<RSS3BaseAPI.Tag.Collectible>
            if (action.metadata && !('value' in action.metadata)) return
            return (
                <Card className={classes.img}>
                    <AssetPreviewer
                        classes={{
                            fallbackImage: classes.fallbackImage,
                        }}
                        pluginID={pluginID}
                        chainId={MaskNetworkMap[feed.network]}
                        url={action.metadata?.image}
                    />
                </Card>
            )
        }
        if (feed.tag === Tag.Donation) {
            const action = feed.actions[0] as RSS3BaseAPI.ActionGeneric<RSS3BaseAPI.Tag.Donation>
            const logo = action.metadata?.logo
            return logo ? <Image className={classes.img} src={logo} /> : null
        }
        if (feed.tag === Tag.Transaction && feed.type === Type.Transfer) {
            const action = feed.actions[0] as RSS3BaseAPI.ActionGeneric<
                RSS3BaseAPI.Tag.Transaction,
                RSS3BaseAPI.Type.Transfer
            >
            const logo = action.metadata?.image
            return logo ? <Image className={classes.img} src={logo} /> : null
        }
        return null
    }, [feed])

    const normalizedFeed = useNormalizeFeed(feed)

    return (
        <Box className={cx(classes.wrapper, className)} {...rest} onClick={() => onSelect(normalizedFeed)}>
            <div className={classes.texts}>
                <Typography component="div">
                    <span className={classes.action}>
                        <ReversedAddress TypographyProps={{ display: 'inline' }} address={address!} /> {feedAction}
                    </span>{' '}
                    <span className={classes.time}>
                        {formatDistanceToNow(new Date(feed.timestamp))} {t.ago()}
                    </span>
                </Typography>
                <Box className={classes.collection}>
                    <Typography fontWeight={700} className={classes.summary}>
                        {normalizedFeed.title}
                    </Typography>
                    <Typography className={classes.summary}>{normalizedFeed.description}</Typography>
                </Box>
            </div>
            <Box className={classes.media}>{logo}</Box>
        </Box>
    )
})
