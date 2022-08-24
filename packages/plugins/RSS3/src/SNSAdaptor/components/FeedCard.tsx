import { NFTCardStyledAssetPlayer, ReversedAddress, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, formatTokenId, isZeroAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, Card, Typography } from '@mui/material'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { memo, useMemo } from 'react'
import { useI18N } from '../../locales'
import { usePatchFeed } from '../hooks'

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
        flexShrink: 0,
    },
    action: {
        color: theme.palette.maskColor.main,
    },
}))

export const ChainID = {
    ethereum: ChainId.Mainnet,
    polygon: ChainId.Matic,
    bnb: ChainId.BSC,
}

enum TAG {
    NFT = 'NFT',
    Token = 'Token',
    POAP = 'POAP',
    Gitcoin = 'Gitcoin',
    Mirror = 'Mirror Entry',
    ETH = 'ETH',
}

export interface FeedCardProps {
    feed: RSS3BaseAPI.Web3Feed
    address?: string
    onSelect: (feed: RSS3BaseAPI.Web3Feed) => void
}

export const FeedCard = memo(({ feed, address, onSelect }: FeedCardProps) => {
    const { classes } = useStyles()
    const t = useI18N()
    const patchedFeed = usePatchFeed(feed)

    const action = useMemo(() => {
        if (!feed) return
        if (feed.tags?.includes(TAG.NFT)) {
            if (isSameAddress(feed.metadata?.from, address)) {
                return (
                    <span>
                        {t.sent_an_NFT_to()}{' '}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={feed.metadata?.to ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
            if (isZeroAddress(feed.metadata?.from)) {
                return t.minted_an_NFT()
            }
            if (isSameAddress(feed.metadata?.to, address)) {
                return (
                    <span>
                        {t.acquired_an_NFT_from()}{' '}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={feed.metadata?.from ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
        }
        if (feed.tags?.includes(TAG.Token) || feed.tags?.includes(TAG.ETH)) {
            if (isSameAddress(feed.metadata?.from, address)) {
                return (
                    <span>
                        {t.sent_to()}{' '}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={feed.metadata?.to ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
            if (isSameAddress(feed.metadata?.to, address)) {
                return (
                    <span>
                        {t.received_from()}{' '}
                        <ReversedAddress
                            TypographyProps={{ display: 'inline' }}
                            address={feed.metadata?.from ?? ZERO_ADDRESS}
                        />
                    </span>
                )
            }
        }
        if (feed.tags?.includes(TAG.Gitcoin)) {
            if (isSameAddress(feed.metadata?.from, address)) {
                return t.donated()
            }
            if (isSameAddress(feed.metadata?.to, address)) {
                return t.received_donation_from()
            }
        }
        if (isSameAddress(feed.metadata?.from, address)) {
            return t.received()
        }
        return t.sent()
    }, [address, feed])

    const logo = useMemo(() => {
        if (feed.tags?.includes(TAG.NFT)) {
            return (
                <Card className={classes.img}>
                    <NFTCardStyledAssetPlayer
                        contractAddress={feed.metadata?.collection_address}
                        chainId={ChainID[feed.metadata?.network ?? 'ethereum']}
                        url={patchedFeed.imageURL}
                        tokenId={feed.metadata?.token_id}
                        classes={{
                            fallbackImage: classes.fallbackImage,
                            wrapper: classes.img,
                            iframe: classes.img,
                        }}
                    />
                </Card>
            )
        }
        if (feed.tags.includes(TAG.Token) || feed.tags.includes(TAG.ETH)) {
            return (
                <TokenIcon
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    chainId={ChainID[feed.metadata?.network ?? 'ethereum']}
                    address={feed.metadata?.token_address ?? ZERO_ADDRESS}
                />
            )
        }
        if (feed.tags.includes(TAG.Gitcoin)) {
            return (
                <img
                    className={classes.img}
                    src={feed.attachments?.find((attachment) => attachment?.type === 'logo')?.address}
                />
            )
        }
        return null
    }, [feed])

    return (
        <Box className={classes.wrapper} onClick={() => onSelect(patchedFeed)}>
            <div className={classes.texts}>
                <Typography>
                    <span className={classes.action}>
                        <ReversedAddress TypographyProps={{ display: 'inline' }} address={address!} /> {action}
                    </span>{' '}
                    <span className={classes.time}>
                        {formatDistanceToNow(new Date(feed.date_updated))} {t.ago()}
                    </span>
                </Typography>
                <Box className={classes.collection}>
                    <Typography fontWeight={700} className={classes.summary}>
                        {patchedFeed.title}
                    </Typography>
                    <Typography className={classes.summary}>
                        {patchedFeed.summary}
                        {formatTokenId(feed.metadata?.token_id ?? '0x00')}
                    </Typography>
                </Box>
            </div>
            <Box className={classes.media}>{logo}</Box>
        </Box>
    )
})
