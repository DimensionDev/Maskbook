import { NFTCardStyledAssetPlayer, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Alchemy_EVM, RSS3BaseAPI } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { resolveIPFSLinkFromURL, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import differenceInCalendarDays from 'date-fns/differenceInDays'
import differenceInCalendarHours from 'date-fns/differenceInHours'
import { useMemo } from 'react'
import { ChainID } from '../constants'
import { ReversedAddress } from './ReversedAddress'
import { useI18N } from '../locales'
import { useAsyncRetry } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    img: {
        width: '64px !important',
        height: '64px !important',
        borderRadius: 8,
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
        maxWidth: '300px',
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
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
}))

export interface FeedCardProps {
    feed: RSS3BaseAPI.Web3Feed
    address?: string
    index: number
    onSelect: (feed: RSS3BaseAPI.Web3Feed) => void
}

export function FeedCard({ feed, address, index, onSelect }: FeedCardProps) {
    const { classes } = useStyles()
    const t = useI18N()

    const { value: NFTMetadata } = useAsyncRetry(async () => {
        if ((feed?.title && feed?.summary) || !feed?.metadata?.collection_address) return

        const res = await Alchemy_EVM.getAsset(feed?.metadata?.collection_address, feed?.metadata?.token_id ?? '', {
            chainId: ChainID[feed?.metadata?.network ?? 'ethereum'],
        })
        return res
    }, [feed?.metadata?.collection_address])

    const action = useMemo(() => {
        if (!feed) return
        if (feed?.tags?.includes('NFT')) {
            if (feed?.metadata?.from?.toLowerCase() === address) {
                return (
                    <span>
                        sent a NFT to <ReversedAddress address={feed?.metadata?.to} />
                    </span>
                )
            }
            if (feed?.metadata?.from === ZERO_ADDRESS) {
                return 'minted a NFT'
            }
            if (feed?.metadata?.to?.toLowerCase() === address) {
                return (
                    <span>
                        acquire a NFT from <ReversedAddress address={feed?.metadata?.from} />
                    </span>
                )
            }
        }
        if (feed?.tags?.includes('Token') || feed?.tags?.includes('ETH')) {
            if (feed?.metadata?.from?.toLowerCase() === address) {
                return (
                    <span>
                        sent to <ReversedAddress address={feed?.metadata?.to} />
                    </span>
                )
            }
            if (feed?.metadata?.to?.toLowerCase() === address) {
                return (
                    <span>
                        received from <ReversedAddress address={feed?.metadata?.from} />
                    </span>
                )
            }
        }
        if (feed?.tags?.includes('Gitcoin')) {
            if (feed?.metadata?.from?.toLowerCase() === address) {
                return 'donated'
            }
            if (feed?.metadata?.to?.toLowerCase() === address) {
                return 'received donation from'
            }
        }
        if (feed?.metadata?.from?.toLowerCase() === address) {
            return 'received'
        }
        return 'sent'
    }, [address, feed])

    const logo = useMemo(() => {
        if (feed?.tags?.includes('NFT')) {
            return (
                <div className={classes.img}>
                    <NFTCardStyledAssetPlayer
                        contractAddress={feed?.metadata?.collection_address}
                        chainId={ChainID[feed?.metadata?.network ?? 'ethereum']}
                        url={resolveIPFSLinkFromURL(
                            NFTMetadata?.metadata?.imageURL ||
                                feed?.attachments?.find((attachment) => attachment?.type === 'preview')?.address ||
                                '',
                        )}
                        tokenId={feed?.metadata?.token_id}
                        classes={{
                            loadingFailImage: classes.loadingFailImage,
                            wrapper: classes.img,
                            iframe: classes.img,
                        }}
                    />
                </div>
            )
        }
        if (feed?.tags.includes('Token') || feed?.tags.includes('ETH')) {
            return (
                <TokenIcon
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    chainId={ChainID[feed?.metadata?.network ?? 'ethereum']}
                    address={feed?.metadata?.token_address ?? ZERO_ADDRESS}
                />
            )
        }
        if (feed?.tags.includes('Gitcoin')) {
            return (
                <img
                    className={classes.img}
                    src={feed?.attachments?.find((attachment) => attachment?.type === 'logo')?.address}
                />
            )
        }
        return null
    }, [feed])

    const time = useMemo(() => {
        const days = differenceInCalendarDays(new Date(), new Date(feed?.date_updated))
        const hours = differenceInCalendarHours(new Date(), new Date(feed?.date_updated)) % 24
        return days ? `${days} ${t.days()} ${hours} ${t.hours()} ${t.ago()}` : `${hours} ${t.hours()} ${t.ago()}`
    }, [feed?.date_updated])
    return (
        <Box
            className={classes.wrapper}
            onClick={() =>
                onSelect({
                    ...feed,
                    title:
                        feed?.title ||
                        NFTMetadata?.metadata?.name ||
                        NFTMetadata?.collection?.name ||
                        NFTMetadata?.contract?.name ||
                        `#${feed?.metadata?.token_id}`,
                    summary:
                        feed?.summary || NFTMetadata?.metadata?.description || NFTMetadata?.collection?.description,
                    imageURL: resolveIPFSLinkFromURL(
                        NFTMetadata?.metadata?.imageURL ||
                            feed?.attachments?.find((attachment) => attachment?.type === 'preview')?.address ||
                            feed?.attachments?.find((attachment) => attachment?.type === 'logo')?.address ||
                            '',
                    ),
                    traits: NFTMetadata?.traits,
                })
            }>
            <div>
                <ReversedAddress address={address} /> {action} <span className={classes.time}>{time}</span>
                <Box className={classes.collection}>
                    <Typography fontWeight={700}>
                        {feed?.title ||
                            NFTMetadata?.metadata?.name ||
                            NFTMetadata?.collection?.name ||
                            NFTMetadata?.contract?.name ||
                            ''}
                    </Typography>
                    <Typography className={classes.summary}>
                        {feed?.summary || NFTMetadata?.metadata?.description || NFTMetadata?.collection?.description} ||
                        `#${feed?.metadata?.token_id}`
                    </Typography>
                </Box>
            </div>
            <Box>{logo}</Box>
        </Box>
    )
}
