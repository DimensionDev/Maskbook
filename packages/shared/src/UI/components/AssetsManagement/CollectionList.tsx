import { Icons } from '@masknet/icons'
import { ElementAnchor, EmptyStatus, Image, RetryHint, isSameNFT } from '@masknet/shared'
import { EMPTY_OBJECT, Sniffings } from '@masknet/shared-base'
import { LoadingBase, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Box, Button, Typography, useForkRef } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { range } from 'lodash-es'
import { memo, useCallback, useRef, type RefObject } from 'react'
import { useSharedI18N } from '../../../locales/i18n_generated.js'
import { CollectibleItem, CollectibleItemSkeleton } from './CollectibleItem.js'
import { Collection, CollectionSkeleton, LazyCollection, type CollectionProps } from './Collection.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { useUserAssets } from './AssetsProvider.js'
import type { CollectibleGridProps } from './types.js'
import { SelectNetworkSidebar } from '../SelectNetworkSidebar/index.js'
import { CollectionsContext } from './CollectionsProvider.js'
import { useChainRuntime } from './ChainRuntimeProvider.js'

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
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        main: {
            flexGrow: 1,
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'auto',
            // For profile-card footer
            paddingBottom: 48,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
        },
        grid: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: typeof columns === 'string' ? columns : `repeat(${columns}, 1fr)`,
            gridGap: gapIsNumber ? theme.spacing(gap) : gap,
            padding: gapIsNumber ? theme.spacing(0, gap, 0) : `0 ${gap} 0`,
            paddingRight: theme.spacing(1),
            boxSizing: 'border-box',
        },
        currentCollection: {
            display: 'flex',
            justifyContent: 'space-between',
            color: theme.palette.maskColor.main,
            margin: theme.spacing(0, gap, 1.5),
        },
        info: {
            display: 'flex',
            alignItems: 'center',
        },
        icon: {
            width: 24,
            height: 24,
            borderRadius: '100%',
            objectFit: 'cover',
        },
        backButton: {
            padding: theme.spacing(1, 0),
            width: 40,
            minWidth: 40,
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            color: theme.palette.maskColor.main,
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
    }
})

function getTopOffset() {
    if (Sniffings.is_twitter_page) {
        // 53, height of the sticky bar of Twitter,
        // 96, height of the header of web3 tab
        return 53 + 96
    }
    // TODO Other SNS pages
    return 0
}

export interface CollectionListProps
    extends BoxProps,
        Pick<CollectionProps, 'disableAction' | 'onActionClick' | 'onItemClick'> {
    gridProps?: CollectibleGridProps
    disableSidebar?: boolean
    disableWindowScroll?: boolean
    selectedAsset?: Web3Helper.NonFungibleAssetAll
    /** User customized assets, will be rendered as flatten */
    additionalAssets?: Web3Helper.NonFungibleAssetAll[]
    /** Pending user customized assets, used to render loading skeletons */
    pendingAdditionalAssetCount?: number
    scrollElementRef?: RefObject<HTMLElement>
    onChainChange?: (chainId?: Web3Helper.ChainIdAll) => void
    onCollectionChange?: (collectionId: string | undefined) => void
}

export const CollectionList = memo(function CollectionList({
    className,
    gridProps = EMPTY_OBJECT,
    disableSidebar,
    disableAction,
    selectedAsset,
    additionalAssets,
    pendingAdditionalAssetCount = 0,
    disableWindowScroll,
    scrollElementRef,
    onActionClick,
    onItemClick,
    onChainChange,
    onCollectionChange,
    ...rest
}: CollectionListProps) {
    const t = useSharedI18N()
    const { classes, cx } = useStyles(gridProps)

    const { pluginID, account, chainId, setChainId, networks } = useChainRuntime()
    const { collections, currentCollection, currentCollectionId, setCurrentCollectionId, loading, error, retry } =
        CollectionsContext.useContainer()

    const handleChainChange = useCallback(
        (chainId: Web3Helper.ChainIdAll | undefined) => {
            setChainId(chainId)
            onChainChange?.(chainId)
            setCurrentCollectionId(undefined)
            onCollectionChange?.(undefined)
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

    const { assetsMapRef, getAssets, getBLockedTokenIds, getVerifiedBy, loadAssets, loadVerifiedBy, isAllHidden } =
        useUserAssets()

    const handleInitialRender = useCallback(
        (collection: Web3Helper.NonFungibleCollectionAll) => {
            const id = collection.id!
            // To reduce requests, check if has been initialized
            if (assetsMapRef.current[id]?.assets.length) return
            loadVerifiedBy(id)
            loadAssets(collection)
        },
        [loadAssets, loadVerifiedBy],
    )

    const sidebar = disableSidebar ? null : (
        <SelectNetworkSidebar
            chainId={chainId}
            gridProps={gridProps}
            onChainChange={handleChainChange}
            pluginID={pluginID}
            networks={networks}
        />
    )

    if (!collections.length && loading && !error && account)
        return (
            <Box className={cx(classes.container, className)} {...rest}>
                <div className={classes.columns}>
                    <div className={classes.main}>
                        <LoadingSkeleton className={classes.grid} />
                    </div>
                    {sidebar}
                </div>
            </Box>
        )

    if (!collections.length && error && account)
        return (
            <Box className={cx(classes.container, className)} {...rest}>
                <Box mt="200px" color={(theme) => theme.palette.maskColor.main}>
                    <RetryHint retry={retry} />
                </Box>
            </Box>
        )

    if ((!loading && !collections.length) || !account || isAllHidden)
        return (
            <Box className={cx(classes.container, className)} {...rest}>
                <div className={classes.columns}>
                    <EmptyStatus flexGrow={1}>{t.no_NFTs_found()}</EmptyStatus>
                    {sidebar}
                </div>
            </Box>
        )

    const currentVerifiedBy = currentCollectionId ? getVerifiedBy(currentCollectionId) : []

    return (
        <Box className={cx(classes.container, className)} ref={containerRef} {...rest}>
            <div className={classes.columns}>
                <div className={classes.main} ref={forkedMainColumnRef}>
                    {currentCollection ? (
                        <div className={classes.currentCollection}>
                            <Box className={classes.info}>
                                {currentCollection.iconURL ? (
                                    <Image className={classes.icon} size={24} src={currentCollection.iconURL} />
                                ) : null}
                                <Typography mx={1}>{currentCollection.name}</Typography>
                                {currentVerifiedBy.length ? (
                                    <ShadowRootTooltip
                                        title={t.verified_by({ marketplace: currentVerifiedBy.join(', ') })}>
                                        <Icons.Verification size={16} />
                                    </ShadowRootTooltip>
                                ) : null}
                            </Box>
                            <Button
                                variant="text"
                                className={classes.backButton}
                                onClick={() => handleCollectionChange(undefined)}>
                                <Icons.Undo size={16} />
                            </Button>
                        </div>
                    ) : null}
                    {currentCollection ? (
                        <ExpandedCollection
                            gridProps={gridProps}
                            pluginID={pluginID}
                            collection={currentCollection}
                            key={currentCollection.id}
                            assets={getAssets(currentCollection).assets}
                            verifiedBy={getVerifiedBy(currentCollection.id!)}
                            loading={getAssets(currentCollection).loading}
                            finished={getAssets(currentCollection).finished}
                            onInitialRender={handleInitialRender}
                            disableAction={disableAction}
                            onActionClick={onActionClick}
                            selectedAsset={selectedAsset}
                            onItemClick={onItemClick}
                        />
                    ) : (
                        <Box className={classes.grid}>
                            {pendingAdditionalAssetCount > 0 ? (
                                <CollectionSkeleton
                                    id="additional-assets"
                                    count={pendingAdditionalAssetCount}
                                    expanded
                                />
                            ) : null}
                            {additionalAssets?.map((asset) => (
                                <CollectibleItem
                                    key={`additional.${asset.chainId}.${asset.address}.${asset.tokenId}`}
                                    className={className}
                                    asset={asset}
                                    pluginID={pluginID}
                                    disableName
                                    actionLabel={t.send()}
                                    disableAction={disableAction}
                                    isSelected={isSameNFT(pluginID, asset, selectedAsset)}
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
                                        selectedAsset={selectedAsset}
                                        onExpand={handleCollectionChange}
                                        onInitialRender={handleInitialRender}
                                        disableAction={disableAction}
                                        onActionClick={onActionClick}
                                        onItemClick={onItemClick}
                                    />
                                )
                            })}
                        </Box>
                    )}
                    {error ? <RetryHint hint={false} retry={retry} /> : null}
                </div>
                {sidebar}
            </div>
        </Box>
    )
})

interface ExpandedCollectionProps extends CollectionProps {
    gridProps?: CollectibleGridProps
}

/** An ExpandedCollection tiles collectable cards */
const ExpandedCollection = memo(({ gridProps = EMPTY_OBJECT, ...collectionProps }: ExpandedCollectionProps) => {
    const { loadAssets, getAssets } = useUserAssets()
    const { classes, theme } = useStyles(gridProps)
    const { collection, assets } = collectionProps
    const { finished, loading } = getAssets(collection)
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

ExpandedCollection.displayName = 'ExpandedCollection'
