import { NFTCardStyledAssetPlayer, ReversedAddress, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Alchemy_EVM, RSS3BaseAPI } from '@masknet/web3-providers'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, formatTokenId, isZeroAddress, resolveIPFSLinkFromURL, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, Typography, Card } from '@mui/material'
import { useMemo } from 'react'
import { useI18N } from '../../locales'
import { useAsyncRetry } from 'react-use'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

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
                <Typography width={490}>
                    <span className={classes.action}>
                        <ReversedAddress TypographyProps={{ display: 'inline' }} address={address!} /> {action}
                    </span>{' '}
                    <span className={classes.time}>
                        {formatDistanceToNow(new Date(feed.date_updated))} {t.ago()}
                    </span>
                </Typography>
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
                        {formatTokenId(feed.metadata?.token_id ?? '0x00')}
                    </Typography>
                </Box>
            </div>
            <Box>{logo}</Box>
        </Box>
    )
}
