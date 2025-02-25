import { Trans } from '@lingui/react/macro'
import { ElementAnchor, EmptyStatus, ReloadStatus, isSameNFT } from '@masknet/shared'
import { EMPTY_LIST, EMPTY_OBJECT, Sniffings } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Box, useForkRef } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { compact, range } from 'lodash-es'
import { memo, useCallback, useMemo, useRef, type ReactNode, type Ref } from 'react'
import { SelectNetworkSidebar } from '../SelectNetworkSidebar/index.js'
import { useUserAssets } from './AssetsProvider.js'
import { useChainRuntime } from './ChainRuntimeProvider.js'
import { CollectibleItem, CollectibleItemSkeleton } from './CollectibleItem.js'
import { Collection, CollectionSkeleton, LazyCollection, type CollectionProps } from './Collection.js'
import { CollectionHeader } from './CollectionHeader.js'
import { CollectionsContext } from './CollectionsProvider.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import type { CollectibleGridProps } from './types.js'

const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 4, gap = 1.5 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        container: {
            boxSizing: 'border-box',
            overflow: 'auto',
            flex: 1,
        },
        columns: {
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'auto',
            flexDirection: 'row',
            display: 'flex',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        sidebar: {
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(0.25),
            scrollbarWidth: 'none',
        },
        main: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'auto',
            // For profile-card footer
            paddingBottom: 48,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
        },
        emptyMain: {
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
        },
        expanded: {
            flexGrow: 1,
            minHeight: 0,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        grid: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: typeof columns === 'string' ? columns : `repeat(${columns}, 1fr)`,
            gridGap: gapIsNumber ? theme.spacing(gap) : gap,
            padding: gapIsNumber ? theme.spacing(0, gap, 0) : `0 ${gap} 0`,
            paddingLeft: theme.spacing(1),
            boxSizing: 'border-box',
        },
        collectionHeader: {
            margin: theme.spacing(0, gap, 1.5),
        },
    }
})

function getTopOffset() {
    if (Sniffings.is_twitter_page) {
        // 53, height of the sticky bar of Twitter,
        // 96, height of the header of web3 tab
        return 53 + 96
    }
    // TODO Other sites
    return 0
}

export interface CollectionListProps
    extends BoxProps,
        Pick<CollectionProps, 'disableAction' | 'onActionClick'>,
        withClasses<'sidebar' | 'grid'> {
    gridProps?: CollectibleGridProps
    disableSidebar?: boolean
    disableWindowScroll?: boolean
    /** User customized assets, will be rendered as flatten */
    additionalAssets?: Web3Helper.NonFungibleAssetAll[]
    /** Pending user customized assets, used to render loading skeletons */
    pendingAdditionalAssetCount?: number
    emptyText?: ReactNode
    scrollElementRef?: Ref<HTMLElement | null>
    from?: 'web3Profile' | 'profileCard'
    onChainChange?: (chainId?: Web3Helper.ChainIdAll) => void
    onCollectionChange?: (collectionId: string | undefined) => void
    onItemClick?: (asset: Web3Helper.NonFungibleAssetAll) => void
}

export const CollectionList = memo(function CollectionList({
    className,
    gridProps = EMPTY_OBJECT,
    disableSidebar,
    disableAction,
    additionalAssets,
    pendingAdditionalAssetCount = 0,
    disableWindowScroll,
    scrollElementRef,
    emptyText,
    from,
    onActionClick,
    onChainChange,
    onCollectionChange,
    onItemClick,
    ...rest
}: CollectionListProps) {
    const { classes, cx } = useStyles(gridProps, { props: rest })

    const { pluginID, account, chainId, setChainId, networks } = useChainRuntime()
    const { collections, currentCollection, setCurrentCollectionId, loading, error, retry } =
        CollectionsContext.useContainer()
    const { selectedAsset, selectedAssets, selectMode, multiple, searchKeyword } = useUserAssets()

    const handleChainChange = useCallback(
        (chainId: Web3Helper.ChainIdAll | undefined) => {
            setChainId(chainId)
            onChainChange?.(chainId)
            setCurrentCollectionId(undefined)
            onCollectionChange?.(undefined)
            if (from === 'profileCard')
                Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineHoverUserNftSwitchChain)
            if (from === 'web3Profile')
                Telemetry.captureEvent(EventType.Access, EventID.EntryProfileUserNftsSwitchChain)
        },
        [onChainChange],
    )
    const containerRef = useRef<HTMLDivElement>(null)
    const mainColumnRef = useRef<HTMLDivElement>(null)
    const forkedMainColumnRef = useForkRef(mainColumnRef, scrollElementRef)
    const scrollToTop = useCallback(() => {
        if (disableWindowScroll) {
            mainColumnRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return
            const offset = getTopOffset()
            if (Math.abs(rect.top - offset) < 50) return
            const top = rect.top + window.scrollY - offset
            window.scroll({ top, behavior: 'smooth' })
        }
    }, [disableWindowScroll])

    const handleCollectionChange = useCallback(
        (id: string | undefined) => {
            setCurrentCollectionId(id)
            onCollectionChange?.(id)

            if (!id) return
            scrollToTop()
        },
        [onCollectionChange, scrollToTop],
    )

    const {
        assetsMapRef,
        getAssets,
        getBLockedTokenIds,
        getVerifiedBy,
        loadAssets,
        loadVerifiedBy,
        isAllHidden,
        isEmpty,
    } = useUserAssets()
    const additional = useMemo(() => {
        if (!additionalAssets?.length) return EMPTY_LIST
        const collectionAddresses = compact(collections.map((x) => x.address?.toLowerCase()))
        // If it's in our collections, no need to treat it as additional one
        return additionalAssets.filter((x) => !collectionAddresses.includes(x.address.toLowerCase()))
    }, [additionalAssets, account, collections])

    const handleInitialRender = useCallback(
        (collection: Web3Helper.NonFungibleCollectionAll) => {
            const id = collection.id!
            const assetsState = assetsMapRef.current[`${account}.${id}`]
            // To reduce requests, check if has been initialized
            if (assetsState?.assets.length || assetsState?.loading) return
            loadVerifiedBy(id)
            loadAssets(collection)
        },
        [loadAssets, loadVerifiedBy, account],
    )

    const sidebar =
        disableSidebar ? null : (
            <SelectNetworkSidebar
                chainId={chainId}
                className={classes.sidebar}
                onChainChange={handleChainChange}
                pluginID={pluginID}
                networks={networks}
            />
        )

    const filteredAssets = useMemo(() => {
        if (!currentCollection) return EMPTY_LIST
        const assets = getAssets(currentCollection).assets
        if (!searchKeyword) return assets
        const kw = searchKeyword.toLowerCase()
        return assets.filter((x) => {
            return x.metadata?.name.includes(kw) || x.metadata?.tokenId?.includes(kw.replace(/^#/, ''))
        })
    }, [getAssets, currentCollection, searchKeyword])

    if (!collections.length && loading && !error && account)
        return (
            <Box className={cx(classes.container, className)} {...rest}>
                <div className={classes.columns}>
                    {sidebar}
                    <div className={classes.main}>
                        <LoadingSkeleton className={classes.grid} />
                    </div>
                </div>
            </Box>
        )

    if (!collections.length && error && account)
        return (
            <Box className={cx(classes.container, className)} {...rest}>
                <Box mt="200px" color={(theme) => theme.palette.maskColor.main}>
                    <ReloadStatus onRetry={retry} />
                </Box>
            </Box>
        )

    if ((!loading && !collections.length) || !account || isAllHidden || isEmpty) {
        return (
            <Box className={cx(classes.container, className)} {...rest}>
                <div className={classes.columns}>
                    {sidebar}
                    <Box className={cx(classes.main, classes.emptyMain)} display="flex">
                        <EmptyStatus flexGrow={1}>{emptyText ?? <Trans>No NFTs found.</Trans>}</EmptyStatus>
                    </Box>
                </div>
            </Box>
        )
    }

    return (
        <Box className={cx(classes.container, className)} ref={containerRef} {...rest}>
            <div className={classes.columns}>
                {sidebar}
                <div className={classes.main} ref={forkedMainColumnRef}>
                    <CollectionHeader className={classes.collectionHeader} onResetCollection={handleCollectionChange} />
                    {currentCollection ?
                        <Box className={classes.expanded} display={!selectMode || !multiple ? 'contents' : undefined}>
                            <ExpandedCollection
                                gridProps={gridProps}
                                pluginID={pluginID}
                                collection={currentCollection}
                                key={currentCollection.id}
                                assets={filteredAssets}
                                verifiedBy={getVerifiedBy(currentCollection.id!)}
                                loading={getAssets(currentCollection).loading}
                                finished={getAssets(currentCollection).finished}
                                emptyText={emptyText}
                                disableAction={disableAction}
                                onActionClick={onActionClick}
                                onInitialRender={handleInitialRender}
                                onItemClick={onItemClick}
                            />
                        </Box>
                    :   <Box className={classes.grid}>
                            {pendingAdditionalAssetCount > 0 ?
                                <CollectionSkeleton
                                    id="additional-assets"
                                    count={pendingAdditionalAssetCount}
                                    expanded
                                />
                            :   null}
                            {additional.map((asset) => (
                                <CollectibleItem
                                    key={`additional.${asset.chainId}.${asset.address}.${asset.tokenId}`}
                                    className={className}
                                    asset={asset}
                                    pluginID={pluginID}
                                    disableName
                                    actionLabel={<Trans>Send</Trans>}
                                    disableAction={disableAction}
                                    isSelected={
                                        multiple ?
                                            selectedAssets?.some((a) => isSameNFT(pluginID, asset, a))
                                        :   isSameNFT(pluginID, asset, selectedAsset)
                                    }
                                    onActionClick={onActionClick}
                                    onItemClick={onItemClick}
                                />
                            ))}
                            {collections.map((collection) => {
                                const assetsState = getAssets(collection)
                                return (
                                    <LazyCollection
                                        pluginID={pluginID}
                                        collection={collection}
                                        key={`${collection.chainId}.${collection.id}`}
                                        assets={assetsState.assets}
                                        verifiedBy={getVerifiedBy(collection.id!)}
                                        loading={assetsState.loading}
                                        finished={assetsState.finished}
                                        blockedTokenIds={getBLockedTokenIds(collection)}
                                        onExpand={handleCollectionChange}
                                        onInitialRender={handleInitialRender}
                                        disableAction={disableAction}
                                        onActionClick={onActionClick}
                                        onItemClick={onItemClick}
                                    />
                                )
                            })}
                        </Box>
                    }
                    {error ?
                        <ReloadStatus onRetry={retry} />
                    :   null}
                </div>
            </div>
        </Box>
    )
})

interface ExpandedCollectionProps extends CollectionProps {
    gridProps?: CollectibleGridProps
    emptyText?: ReactNode
}

/** An ExpandedCollection tiles collectable cards */
const ExpandedCollection = memo(function ExpandedCollection({
    gridProps = EMPTY_OBJECT,
    emptyText,
    ...collectionProps
}: ExpandedCollectionProps) {
    const { loadAssets, getAssets } = useUserAssets()
    const { classes, theme } = useStyles(gridProps)
    const { collection, assets } = collectionProps
    const { finished, loading } = getAssets(collection)

    if (finished && !assets.length)
        return <EmptyStatus flexGrow={1}>{emptyText ?? <Trans>No NFTs found.</Trans>}</EmptyStatus>

    return (
        <>
            <Box width="100%">
                <Box className={classes.grid}>
                    <Collection {...collectionProps} expanded ref={undefined} />
                    {loading ? range(20).map((i) => <CollectibleItemSkeleton omitName key={i} />) : null}
                </Box>
            </Box>
            <ElementAnchor
                key={assets.length}
                callback={() => {
                    loadAssets(collection)
                }}>
                {finished ? null : <LoadingBase color={theme.palette.maskColor.main} />}
            </ElementAnchor>
        </>
    )
})
