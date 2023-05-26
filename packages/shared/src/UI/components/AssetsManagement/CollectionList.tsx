import { Icons } from '@masknet/icons'
import { ElementAnchor, EmptyStatus, Image, NetworkIcon, RetryHint } from '@masknet/shared'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptors } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as FlowChainId } from '@masknet/web3-shared-flow'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { Box, Button, Typography, styled } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { range, sortBy } from 'lodash-es'
import { memo, useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react'
import { useSharedI18N } from '../../../locales/i18n_generated.js'
import { CollectibleItemSkeleton } from './CollectibleItem.js'
import { Collection, LazyCollection, type CollectionProps } from './Collection.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { useUserAssets } from './UserAssetsContext.js'
import type { CollectibleGridProps } from './types.js'
import { useCollections } from './useCollections.js'

const AllButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    padding: 0,
    borderRadius: '50%',
    fontSize: 10,
    backgroundColor: theme.palette.maskColor.highlight,
    '&:hover': {
        backgroundColor: theme.palette.maskColor.highlight,
        boxShadow: 'none',
    },
}))

const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 4, gap = 1.5 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        container: {
            boxSizing: 'border-box',
            overflow: 'auto',
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
        sidebar: {
            width: 36,
            flexShrink: 0,
            paddingRight: theme.spacing(1.5),
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
            boxSizing: 'border-box',
            height: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        networkButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            width: 24,
            minWidth: 24,
            height: 24,
            maxWidth: 24,
            padding: 0,
        },
        indicator: {
            position: 'absolute',
            right: -3,
            bottom: -1,
        },
    }
})

const SimpleHashSupportedChains: Record<NetworkPluginID, number[]> = {
    [NetworkPluginID.PLUGIN_EVM]: [
        ChainId.Mainnet,
        ChainId.BSC,
        ChainId.Matic,
        ChainId.Arbitrum,
        ChainId.Optimism,
        ChainId.Avalanche,
        ChainId.xDai,
    ],
    [NetworkPluginID.PLUGIN_SOLANA]: [SolanaChainId.Mainnet],
    [NetworkPluginID.PLUGIN_FLOW]: [FlowChainId.Mainnet],
}

export interface CollectionListProps
    extends BoxProps,
        Pick<CollectionProps, 'disableAction' | 'onActionClick' | 'onItemClick'> {
    account: string
    pluginID: NetworkPluginID
    defaultChainId?: Web3Helper.ChainIdAll
    gridProps?: CollectibleGridProps
    disableSidebar?: boolean
    disableWindowScroll?: boolean
}

export function CollectionList({
    className,
    account,
    pluginID,
    defaultChainId,
    gridProps = EMPTY_OBJECT,
    disableSidebar,
    disableAction,
    disableWindowScroll,
    onActionClick,
    onItemClick,
    ...rest
}: CollectionListProps) {
    const t = useSharedI18N()
    const { classes, cx } = useStyles(gridProps)

    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()

    const allNetworks = useNetworkDescriptors(pluginID)
    const networks = useMemo(() => {
        const supported = SimpleHashSupportedChains[pluginID]
        return sortBy(
            allNetworks.filter((x) => x.isMainnet && supported.includes(x.chainId)),
            (x) => supported.indexOf(x.chainId),
        )
    }, [allNetworks, pluginID])

    const currentChainId = chainId ?? defaultChainId ?? (networks.length === 1 ? networks[0].chainId : chainId)
    const { collections, currentCollection, currentCollectionId, setCurrentCollectionId, loading, error, retry } =
        useCollections(pluginID, currentChainId, account)

    const { assetsMapRef, getAssets, getVerifiedBy, loadAssets, loadVerifiedBy } = useUserAssets()

    const handleInitialRender = useCallback(
        (collection: Web3Helper.NonFungibleCollectionAll) => {
            const id = collection.id!
            // To reduce requests, check if has been initialized
            if (assetsMapRef.current[id]) return
            loadAssets(collection)
            loadVerifiedBy(id)
        },
        [loadAssets, loadVerifiedBy],
    )

    const sidebar = disableSidebar ? null : (
        <div className={classes.sidebar}>
            {networks.length > 1 ? (
                <AllButton
                    className={classes.networkButton}
                    onClick={() => {
                        setChainId(undefined)
                        setCurrentCollectionId(undefined)
                    }}>
                    All
                    {!currentChainId ? <Icons.BorderedSuccess className={classes.indicator} size={12} /> : null}
                </AllButton>
            ) : null}
            {networks.map((x) => (
                <Button
                    variant="text"
                    key={x.chainId}
                    className={classes.networkButton}
                    disableRipple
                    onClick={() => {
                        setChainId(x.chainId)
                        setCurrentCollectionId(undefined)
                    }}>
                    <NetworkIcon pluginID={pluginID} chainId={x.chainId} ImageIconProps={{ size: 24 }} />
                    {currentChainId === x.chainId ? (
                        <Icons.BorderedSuccess className={classes.indicator} size={12} />
                    ) : null}
                </Button>
            ))}
        </div>
    )

    const containerRef = useRef<HTMLDivElement>(null)
    const mainColumnRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!currentCollectionId) return
        if (disableWindowScroll) {
            mainColumnRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return
            // 53, height of the sticky bar of Twitter,
            // 96, height of the header of web3 tab
            const offset = 53 + 96
            if (Math.abs(rect.top - offset) < 50) return
            const top = rect.top + window.scrollY - offset
            window.scroll({ top, behavior: 'smooth' })
        }
    }, [!currentCollectionId, disableWindowScroll])

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

    if ((!loading && !collections.length) || !account)
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
                <div className={classes.main} ref={mainColumnRef}>
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
                                onClick={() => setCurrentCollectionId(undefined)}>
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
                            assets={getAssets(currentCollection.id!).assets}
                            verifiedBy={getVerifiedBy(currentCollection.id!)}
                            loading={getAssets(currentCollection.id!).loading}
                            expanded
                            onInitialRender={handleInitialRender}
                            disableAction={disableAction}
                            onActionClick={onActionClick}
                            onItemClick={onItemClick}
                        />
                    ) : (
                        <Box className={classes.grid}>
                            {collections.map((collection) => {
                                const assetsState = getAssets(collection.id!)
                                return (
                                    <LazyCollection
                                        pluginID={pluginID}
                                        collection={collection}
                                        key={`${collection.chainId}.${collection.id}`}
                                        assets={assetsState.assets}
                                        verifiedBy={getVerifiedBy(collection.id!)}
                                        loading={assetsState.loading}
                                        onExpand={setCurrentCollectionId}
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
}

interface ExpandedCollectionProps extends CollectionProps {
    gridProps?: CollectibleGridProps
}

/** An ExpandedCollection tiles collectable cards */
const ExpandedCollection: FC<ExpandedCollectionProps> = memo(({ gridProps = EMPTY_OBJECT, ...collectionProps }) => {
    const { loadAssets, getAssets } = useUserAssets()
    const { classes, theme } = useStyles(gridProps)
    const { collection, assets } = collectionProps
    const id = collection.id!
    const { finished, loading } = getAssets(id)
    return (
        <>
            <Box width="100%">
                <Box className={classes.grid}>
                    <Collection {...collectionProps} />
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
