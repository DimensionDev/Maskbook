import { NFTCardStyledAssetPlayer, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Alchemy_EVM, RSS3BaseAPI } from '@masknet/web3-providers'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, resolveIPFSLinkFromURL, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, Typography, Card } from '@mui/material'
import differenceInCalendarDays from 'date-fns/differenceInDays'
import differenceInCalendarHours from 'date-fns/differenceInHours'
import { useMemo } from 'react'
import { ReversedAddress } from './ReversedAddress'
import { useI18N } from '../../locales'
import { useAsyncRetry } from 'react-use'

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
        '-webkit-line-clamp': '1',
        maxWidth: '400px',
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        color: theme.palette.maskColor.main,
    },
    defaultImage: {
        background: theme.palette.maskColor.modalTitleBg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    loadingFailImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 64,
        height: 64,
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

export function FeedCard({ feed, address, onSelect }: FeedCardProps) {
    const { classes } = useStyles()
    const t = useI18N()

    const { value: NFTMetadata } = useAsyncRetry(async () => {
        if ((feed.title && feed.summary) || !feed.metadata?.collection_address) return

        const res = await Alchemy_EVM.getAsset(feed.metadata?.collection_address, feed.metadata?.token_id ?? '', {
            chainId: ChainID[feed.metadata?.network ?? 'ethereum'],
        })
        return res
    }, [feed.metadata?.collection_address])

    const action = useMemo(() => {
        if (!feed) return
        if (feed.tags?.includes(TAG.NFT)) {
            if (isSameAddress(feed.metadata?.from?.toLowerCase(), address)) {
                return (
                    <span>
                        {t.sent_a_NFT_to()} <ReversedAddress address={feed.metadata?.to} />
                    </span>
                )
            }
            if (isSameAddress(feed.metadata?.from, ZERO_ADDRESS)) {
                return t.minted_a_NFT()
            }
            if (isSameAddress(feed.metadata?.to?.toLowerCase(), address)) {
                return (
                    <span>
                        {t.acquired_a_NFT_from()} <ReversedAddress address={feed.metadata?.from} />
                    </span>
                )
            }
        }
        if (feed.tags?.includes(TAG.Token) || feed.tags?.includes(TAG.ETH)) {
            if (isSameAddress(feed.metadata?.from?.toLowerCase(), address)) {
                return (
                    <span>
                        {t.sent_to()} <ReversedAddress address={feed.metadata?.to} />
                    </span>
                )
            }
            if (isSameAddress(feed.metadata?.to?.toLowerCase(), address)) {
                return (
                    <span>
                        {t.received_from()} <ReversedAddress address={feed.metadata?.from} />
                    </span>
                )
            }
        }
        if (feed.tags?.includes(TAG.Gitcoin)) {
            if (isSameAddress(feed.metadata?.from?.toLowerCase(), address)) {
                return t.donated()
            }
            if (isSameAddress(feed.metadata?.to?.toLowerCase(), address)) {
                return t.received_donation_from()
            }
        }
        if (isSameAddress(feed.metadata?.from?.toLowerCase(), address)) {
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
                        url={resolveIPFSLinkFromURL(
                            NFTMetadata?.metadata?.imageURL ||
                                feed.attachments?.find((attachment) => attachment?.type === 'preview')?.address ||
                                '',
                        )}
                        tokenId={feed.metadata?.token_id}
                        classes={{
                            loadingFailImage: classes.loadingFailImage,
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

    const time = useMemo(() => {
        const days = differenceInCalendarDays(new Date(), new Date(feed.date_updated))
        const hours = differenceInCalendarHours(new Date(), new Date(feed.date_updated))
        return [
            days > 0 ? `${days} ${days > 1 ? t.days() : t.day()} ` : '',
            hours > 0 ? `${hours} ${hours > 1 ? t.hours() : t.hour()} ` : '',
            t.ago(),
        ].join('')
    }, [feed.date_updated, t])
    return (
        <Box
            className={classes.wrapper}
            onClick={() =>
                onSelect({
                    ...feed,
                    title:
                        feed.title ||
                        NFTMetadata?.metadata?.name ||
                        NFTMetadata?.collection?.name ||
                        NFTMetadata?.contract?.name ||
                        `#${feed.metadata?.token_id}`,
                    summary: feed.summary || NFTMetadata?.metadata?.description || NFTMetadata?.collection?.description,
                    imageURL: resolveIPFSLinkFromURL(
                        NFTMetadata?.metadata?.imageURL ||
                            feed.attachments?.find((attachment) => attachment?.type === 'preview')?.address ||
                            feed.attachments?.find((attachment) => attachment?.type === 'logo')?.address ||
                            '',
                    ),
                    traits: NFTMetadata?.traits,
                })
            }>
            <div>
                <>
                    <span className={classes.action}>
                        <ReversedAddress address={address} /> {action}
                    </span>{' '}
                    <span className={classes.time}>{time}</span>
                </>
                <Box className={classes.collection}>
                    <Typography fontWeight={700} className={classes.summary}>
                        {feed.title ||
                            NFTMetadata?.metadata?.name ||
                            NFTMetadata?.collection?.name ||
                            NFTMetadata?.contract?.name ||
                            ''}
                    </Typography>
                    <Typography className={classes.summary}>
                        {feed.summary || NFTMetadata?.metadata?.description || NFTMetadata?.collection?.description} ||
                        `#${feed.metadata?.token_id}`
                    </Typography>
                </Box>
            </div>
            <Box>{logo}</Box>
        </Box>
    )
}
