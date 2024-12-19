import { useCallback, useEffect, useMemo } from 'react'
import { noop, range } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ElementAnchor, AssetPreviewer, RetryHint } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { CrossIsolationMessages, NetworkPluginID, type PageIndicator } from '@masknet/shared-base'
import { useWeb3Hub, useWeb3Utils } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Checkbox, List, ListItem, Radio, Stack, Typography, type ListProps, Skeleton } from '@mui/material'
import { isLens, resolveImageURL } from '@masknet/web3-shared-evm'
import { useInfiniteQuery } from '@tanstack/react-query'

interface NFTItemProps {
    token: Web3Helper.NonFungibleTokenAll
    pluginID: NetworkPluginID
}

export type NFTKeyPair = [address: string, tokenId: string]

const useStyles = makeStyles<{ columns?: number; gap?: number }>()((theme, { columns = 4, gap = 12 }) => {
    const isLight = theme.palette.mode === 'light'
    return {
        checkbox: {
            position: 'absolute',
            right: 0,
            top: 0,
        },
        list: {
            gridGap: gap,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
        },
        nftContainer: {
            background: theme.palette.maskColor.bg,
            borderRadius: 8,
            width: 126,
            height: 154,
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            '&:hover': {
                backgroundColor: isLight ? theme.palette.background.paper : undefined,
                boxShadow: isLight ? '0px 4px 30px rgba(0, 0, 0, 0.1)' : undefined,
            },
        },
        nftItem: {
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            padding: 0,
            flexDirection: 'column',
            userSelect: 'none',
        },
        disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
        selected: {
            position: 'relative',
            '&::after': {
                position: 'absolute',
                border: `2px solid ${theme.palette.primary.main}`,
                content: '""',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                boxSizing: 'border-box',
                width: '100%',
                height: '100%',
                borderRadius: 12,
            },
        },
        inactive: {
            opacity: 0.5,
        },
        fallbackImage: {
            width: 30,
            height: 30,
        },
        fallbackENSImage: {
            width: '100%',
            height: '100%',
        },
        image: {
            background: 'transparent !important',
            width: 126,
            height: 126,
        },
        caption: {
            padding: theme.spacing(0.5),
            color: theme.palette.text.primary,
            fontWeight: 700,
            fontSize: 12,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        root: {
            width: 'auto',
            height: 'auto',
        },
    }
})

export function NFTItem({ token, pluginID }: NFTItemProps) {
    const { classes } = useStyles({})
    const Utils = useWeb3Utils(pluginID)
    const caption = isLens(token.metadata?.name) ? token.metadata?.name : Utils.formatTokenId(token.tokenId, 4)

    const onClick = useCallback(() => {
        if (!token.chainId || !pluginID) return
        CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
            open: true,
            chainId: token.chainId,
            pluginID,
            tokenId: token.tokenId,
            tokenAddress: token.address,
        })
    }, [pluginID, token.chainId, token.tokenId, token.address])

    const fallbackImageURL = resolveImageURL(
        undefined,
        token.metadata?.name,
        token.collection?.name,
        token.contract?.address,
    )
    return (
        <div className={classes.nftContainer} onClick={onClick}>
            <AssetPreviewer
                url={token.metadata?.imageURL ?? token.metadata?.imageURL}
                classes={{
                    fallbackImage: fallbackImageURL ? classes.fallbackENSImage : classes.fallbackImage,
                    container: classes.image,
                    root: classes.root,
                }}
                fallbackImage={fallbackImageURL}
            />
            <TextOverflowTooltip as={ShadowRootTooltip} title={caption} disableInteractive arrow placement="bottom">
                <Typography className={classes.caption}>
                    {Utils.isValidDomain(token.metadata?.name ?? '') || pluginID === NetworkPluginID.PLUGIN_SOLANA ?
                        token.metadata?.name
                    :   caption}
                </Typography>
            </TextOverflowTooltip>
        </div>
    )
}

export function NFTItemSkeleton() {
    const { classes } = useStyles({})
    return (
        <div className={classes.nftContainer}>
            <Skeleton variant="rectangular" height={126} width={126} />
            <Skeleton variant="text" className={classes.caption} />
        </div>
    )
}

interface Props extends Omit<ListProps, 'onChange'> {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    selectable?: boolean
    /** SimpleHash collection */
    collectionId?: string
    selectedPairs?: NFTKeyPair[]
    onChange?: (id: string | null, contractAddress?: string) => void
    limit?: number
    columns?: number
    gap?: number
}
export function NFTList({
    selectable,
    selectedPairs,
    collectionId,
    onChange,
    limit = 1,
    columns = 4,
    gap = 12,
    className,
    pluginID,
    chainId,
    ...rest
}: Props) {
    const { classes, cx } = useStyles({ columns, gap })

    const reachedLimit = selectedPairs && selectedPairs.length >= limit

    const toggleItem = (currentId: string | null, contractAddress?: string) => {
        onChange?.(currentId, contractAddress)
    }
    const includes: (pairs: NFTKeyPair[], pair: NFTKeyPair) => boolean =
        pluginID === NetworkPluginID.PLUGIN_EVM ?
            (pairs, pair) => !!pairs.find(([address, id]) => isSameAddress(address, pair[0]) && id === pair[1])
        :   (pairs, pair) => !!pairs.find(([, tokenId]) => tokenId === pair[1])

    const isRadio = limit === 1
    const SelectComponent = isRadio ? Radio : Checkbox

    const Hub = useWeb3Hub(pluginID, { chainId })
    const { data, isFetching, fetchNextPage, hasNextPage, error } = useInfiniteQuery({
        queryKey: ['non-fungible-assets', 'by-collection', collectionId, chainId],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: async ({ pageParam }) => {
            if (!collectionId) return
            return Hub.getNonFungibleAssetsByCollection(collectionId, {
                indicator: pageParam,
                size: 50,
                chainId,
            })
        },
        getNextPageParam(lastPage) {
            return lastPage?.nextIndicator as PageIndicator
        },
    })
    const tokens = useMemo(() => data?.pages.flatMap((x) => x?.data ?? []) ?? [], [data?.pages])

    // Automatically fetch next page if the last page is empty
    const lastPage = data?.pages.at(-1)?.data
    useEffect(() => {
        if (lastPage?.length !== 0) return
        fetchNextPage()
    }, [lastPage, fetchNextPage])

    const skeletonSize = columns - (tokens.length % columns)

    return (
        <>
            <List className={cx(classes.list, className)} {...rest}>
                {tokens.map((token) => {
                    const selected =
                        selectedPairs ?
                            includes(selectedPairs, [token.contract?.address, token.tokenId] as NFTKeyPair)
                        :   false
                    const inactive = selectedPairs ? selectedPairs.length > 0 && !selected : false
                    const disabled = selectable ? !isRadio && reachedLimit && !selected : false
                    return (
                        <ListItem
                            key={token.tokenId + token.id}
                            className={cx(classes.nftItem, {
                                [classes.disabled]: disabled,
                                [classes.selected]: selected,
                                [classes.inactive]: inactive,
                            })}>
                            <NFTItem token={token} pluginID={pluginID} />
                            {selectable ?
                                <SelectComponent
                                    size="small"
                                    onChange={noop}
                                    disabled={disabled}
                                    onClick={() => {
                                        if (disabled) return
                                        if (selected) {
                                            toggleItem(null, '')
                                        } else {
                                            toggleItem(token.tokenId, token.contract?.address)
                                        }
                                    }}
                                    className={classes.checkbox}
                                    checked={selected}
                                />
                            :   null}
                        </ListItem>
                    )
                })}
                {isFetching ?
                    range(skeletonSize).map((i) => (
                        <ListItem className={cx(classes.nftItem, classes.inactive)} key={i}>
                            <NFTItemSkeleton />
                        </ListItem>
                    ))
                :   null}
            </List>
            {error && !hasNextPage && tokens.length ?
                <Stack py={1}>
                    <RetryHint hint={false} retry={() => fetchNextPage()} />
                </Stack>
            :   null}
            <Stack py={1}>
                <ElementAnchor callback={() => fetchNextPage()} />
            </Stack>
        </>
    )
}
