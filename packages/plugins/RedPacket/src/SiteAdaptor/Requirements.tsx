import { Icons, type GeneratedIcon, type GeneratedIconProps } from '@masknet/icons'
import { usePostInfoDetails, usePostLink } from '@masknet/plugin-infra/content-script'
import { MaskColors, makeStyles } from '@masknet/theme'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { NFTScanNonFungibleTokenEVM } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Box, IconButton, Link, List, ListItem, Typography, type BoxProps } from '@mui/material'
import { useQueries } from '@tanstack/react-query'
import { sortBy } from 'lodash-es'
import { Fragment, useMemo } from 'react'
import { usePlatformType } from './hooks/usePlatformType.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    box: {
        backgroundColor: 'rgba(24,24,24,0.8)',
        color: MaskColors.dark.text.primary,
        borderRadius: 16,
        padding: theme.spacing(2, 3),
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            padding: theme.spacing(1, 1),
            borderRadius: 8,
        },
    },
    header: {
        fontSize: 16,
        height: 20,
        fontWeight: 700,
        paddingBottom: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.common.white}`,
        display: 'flex',
        alignItems: 'center',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            paddingBottom: theme.spacing(1),
            fontSize: 15,
        },
    },
    closeButton: {
        marginLeft: 'auto',
        color: theme.palette.common.white,
        padding: 0,
    },
    list: {
        padding: 0,
    },
    item: {
        minWidth: 0,
        marginTop: theme.spacing(2),
        padding: 0,
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        height: 18,
    },
    text: {
        display: 'block',
        marginRight: 10,
        flexGrow: 1,
        fontWeight: 'bold',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '&::first-letter': {
            textTransform: 'uppercase',
        },
    },
    icon: {
        marginRight: 10,
    },
    textLink: {
        color: '#8E96FF',
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
    },
    linkIcon: {
        opacity: 0.5,
        color: theme.palette.common.white,
    },
    state: {
        marginLeft: 'auto',
    },
}))

function ResultIcon({ result, ...props }: GeneratedIconProps & { result: boolean }) {
    const Icon = result ? Icons.ResultYes : Icons.ResultNo
    return <Icon {...props} />
}

interface Props extends BoxProps {
    onClose?(): void
    statusList: FireflyRedPacketAPI.ClaimStrategyStatus[]
    showResults?: boolean
}

const IconMap: Record<FireflyRedPacketAPI.PostReactionKind, GeneratedIcon> = {
    like: Icons.Heart,
    repost: Icons.Repost,
    quote: Icons.Repost,
    comment: Icons.Comment,
    collect: Icons.Heart,
}

function resolveProfileUrl(platform: FireflyRedPacketAPI.PlatformType, handle: string) {
    switch (platform) {
        case FireflyRedPacketAPI.PlatformType.farcaster:
            return `/profile/farcaster/${handle}`
        case FireflyRedPacketAPI.PlatformType.lens:
            return `/profile/lens/${handle}`
        case FireflyRedPacketAPI.PlatformType.twitter:
            return `/${handle}`
    }
}
interface NFTListProps {
    nfts: Array<{
        chainId: number
        contractAddress: string
        collectionName?: string
    }>
}
function NFTList({ nfts }: NFTListProps) {
    const { classes } = useStyles()
    const queries = useQueries({
        queries: nfts.map((nft) => ({
            queryKey: ['nft-contract', nft.chainId, nft.contractAddress],
            queryFn: async () => {
                return NFTScanNonFungibleTokenEVM.getCollectionRaw(nft.contractAddress, {
                    chainId: nft.chainId,
                })
            },
        })),
    })
    const Utils = useWeb3Utils()
    return (
        <Box component="span" mx="0.2em">
            {queries.map((query, index) => {
                const { data } = query
                const nft = nfts[index]
                if (!data) return <Fragment key={nft.chainId + nft.contractAddress}>{nft.collectionName}</Fragment>
                const url = Utils.explorerResolver.addressLink(nft.chainId, nft.contractAddress)
                const name = nft.collectionName || data.name || data.symbol
                return (
                    <Link key={index} href={url!} target="_blank" className={classes.textLink}>
                        {name}
                    </Link>
                )
            })}
        </Box>
    )
}

interface FollowProfileProps {
    payload: Array<{ platform: FireflyRedPacketAPI.PlatformType; profileId: string; handle: string }>
    platform: FireflyRedPacketAPI.PlatformType
}

function FollowProfile({ payload }: FollowProfileProps) {
    const { classes } = useStyles()
    return (
        <span>
            {payload.map(({ handle, profileId, platform }) => (
                <Link
                    key={handle}
                    href={resolveProfileUrl(
                        platform,
                        platform === FireflyRedPacketAPI.PlatformType.farcaster ? profileId : handle,
                    )}
                    target="_blank"
                    className={classes.textLink}>
                    @{handle}
                </Link>
            ))}
        </span>
    )
}

export function Requirements({ onClose, statusList, showResults = true, ...props }: Props) {
    const { classes, cx } = useStyles()
    const postLink = usePostLink()
    const postUrl = usePostInfoDetails.url()
    const link = postUrl?.href || postLink.toString()
    const platform = usePlatformType() as FireflyRedPacketAPI.PlatformType
    const requirements = useMemo(() => {
        const orders = ['profileFollow', 'postReaction', 'nftOwned'] as const
        const orderedStatusList = sortBy(statusList, (x) => orders.indexOf(x.type))
        return orderedStatusList.flatMap((status) => {
            if (status.type === 'profileFollow') {
                const payload = status.payload.filter((x) => x.platform === platform)
                return (
                    <ListItem className={classes.item} key={status.type}>
                        <Icons.UserPlus className={classes.icon} size={16} />
                        <Typography className={classes.text}>
                            <Trans>
                                Follow <FollowProfile platform={platform} payload={payload} /> on {platform}
                            </Trans>
                        </Typography>
                        {showResults ?
                            <ResultIcon className={classes.state} size={18} result={status.result} />
                        :   null}
                    </ListItem>
                )
            }
            if (status.type === 'postReaction') {
                // discard `collect` for now
                const conditions = status.result.conditions.filter((x) => x.key !== 'collect')
                const hasRepost = !!conditions.find((x) => (x.key === 'quote' || x.key === 'repost') && x.value)
                let hasRepostCondition = false
                return conditions
                    .reduce((arr: typeof conditions, condition) => {
                        if (condition.key === 'quote' || condition.key === 'repost') {
                            if (hasRepostCondition) return arr
                            hasRepostCondition = true
                            return [...arr, { ...condition, key: 'repost', value: hasRepost }] as typeof conditions
                        }
                        return [...arr, condition]
                    }, [])
                    .map((condition) => {
                        const Icon = IconMap[condition.key]
                        return (
                            <ListItem className={classes.item} key={condition.key}>
                                <Icon className={classes.icon} size={16} />
                                <Typography
                                    className={classes.text}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexGrow: 0,
                                        textTransform: 'capitalize',
                                    }}>
                                    {condition.key}
                                </Typography>
                                <Link href={link} className={classes.link} target="_blank">
                                    <Icons.LinkOut size={16} className={classes.linkIcon} />
                                </Link>
                                {showResults ?
                                    <ResultIcon className={classes.state} size={18} result={condition.value} />
                                :   null}
                            </ListItem>
                        )
                    })
            }
            if (status.type === 'nftOwned') {
                return (
                    <ListItem className={classes.item} key={status.type}>
                        <Icons.FireflyNFT className={classes.icon} size={16} />
                        <Typography className={classes.text}>
                            <Trans>
                                NFT Holder of <NFTList nfts={status.payload} />
                            </Trans>
                        </Typography>
                        {showResults ?
                            <ResultIcon className={classes.state} size={18} result={status.result} />
                        :   null}
                    </ListItem>
                )
            }
            return null
        })
    }, [statusList, platform, showResults])
    return (
        <Box {...props} className={cx(classes.box, props.className)}>
            <Typography variant="h2" className={classes.header}>
                <Trans>Requirements</Trans>
                <IconButton
                    className={classes.closeButton}
                    disableRipple
                    onClick={() => onClose?.()}
                    aria-label="Close">
                    <Icons.Close size={24} />
                </IconButton>
            </Typography>
            <List className={classes.list}>{requirements}</List>
        </Box>
    )
}
