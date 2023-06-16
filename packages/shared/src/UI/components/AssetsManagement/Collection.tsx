import { Icons } from '@masknet/icons'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { ShadowRootTooltip, makeStyles, useDetectOverflow } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Skeleton, Typography } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useEffect, useLayoutEffect, useRef, useState, type HTMLProps } from 'react'
import { useSharedI18N } from '../../../index.js'
import { CollectibleCard } from './CollectibleCard.js'
import { CollectibleItem, CollectibleItemSkeleton, type CollectibleItemProps } from './CollectibleItem.js'
import { useCompactDetection } from './useCompactDetection.js'
import { isSameNFT } from '../../../utils/index.js'

const useStyles = makeStyles<{ compact?: boolean }>()((theme, { compact }) => ({
    folder: {
        overflow: 'auto',
        cursor: 'pointer',
        container: 'folder',
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 8,
    },
    grid: {
        display: 'grid',
        overflow: 'auto',
        gridTemplateColumns: 'repeat(2, 1fr)',
        // TODO Unfortunately, we can't use @container query in shadow DOM yet.
        gridGap: theme.spacing(compact ? 0.5 : 1),
        padding: theme.spacing(compact ? 0.5 : 1),
        aspectRatio: '1 / 1',
        cursor: 'pointer',
    },
    info: {
        alignSelf: 'stretch',
        padding: 6,
    },
    nameRow: {
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: theme.spacing(2),
        minHeight: theme.spacing(2),
        color: theme.palette.maskColor.second,
    },
    tokenId: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: theme.spacing(2),
        minHeight: theme.spacing(2),
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    collectibleCard: {
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: 8,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    extraCount: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.main,
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        fontSize: 14,
    },
}))

export interface CollectionProps
    extends HTMLProps<HTMLDivElement>,
        Pick<CollectibleItemProps, 'disableAction' | 'onActionClick' | 'onItemClick' | 'verifiedBy'> {
    pluginID: NetworkPluginID
    collection: Web3Helper.NonFungibleCollectionAll
    assets: Web3Helper.NonFungibleAssetScope[]
    loading: boolean
    /** set collection expanded */
    expanded?: boolean
    onExpand?(id: string): void
    onInitialRender?(collection: Web3Helper.NonFungibleCollectionAll): void
    selectedAsset?: Web3Helper.NonFungibleAssetScope
}

/**
 * Props inherited from div on take effect when rendering as a folder
 */
export const Collection = memo(
    ({
        className,
        collection,
        pluginID,
        loading,
        assets = EMPTY_LIST,
        verifiedBy,
        expanded,
        onExpand,
        onInitialRender,
        disableAction,
        onActionClick,
        onItemClick,
        selectedAsset,
        ...rest
    }: CollectionProps) => {
        const t = useSharedI18N()
        const { compact, containerRef } = useCompactDetection()
        const { classes, cx } = useStyles({ compact })

        useLayoutEffect(() => {
            onInitialRender?.(collection)
        }, [])

        const [nameOverflow, nameRef] = useDetectOverflow()

        if (loading && !assets.length) {
            return <CollectionSkeleton id={collection.id!} count={collection.balance!} expanded={expanded} />
        }

        const hasExtra = collection.balance! > 4 && !expanded
        const assetsSlice = hasExtra ? assets.slice(0, 3) : assets

        if (collection.balance! <= 2 || expanded) {
            const renderAssets = assetsSlice.map((asset) => (
                <CollectibleItem
                    key={`${asset.chainId}.${asset.address}.${asset.tokenId}`}
                    className={className}
                    asset={asset}
                    pluginID={pluginID}
                    disableName={expanded}
                    actionLabel={t.send()}
                    disableAction={disableAction}
                    onActionClick={onActionClick}
                    onItemClick={onItemClick}
                    verifiedBy={verifiedBy}
                    isSelected={isSameNFT(pluginID, asset, selectedAsset)}
                />
            ))
            return <>{renderAssets}</>
        }

        const renderAssets = assetsSlice.map((asset) => (
            <CollectibleCard
                className={classes.collectibleCard}
                asset={asset}
                pluginID={pluginID}
                key={`${collection.id}.${asset.address}.${asset.tokenId}`}
                disableNetworkIcon
            />
        ))
        return (
            <ShadowRootTooltip
                title={nameOverflow ? collection.name : undefined}
                placement="top"
                disableInteractive
                arrow>
                <div
                    className={cx(className, classes.folder)}
                    {...rest}
                    onClick={() => {
                        onExpand?.(collection.id!)
                    }}
                    ref={containerRef}>
                    <div className={classes.grid}>
                        {renderAssets}
                        {hasExtra ? (
                            <Typography component="div" className={classes.extraCount}>
                                {collection.balance! > 1002 ? '>999' : `+${collection.balance! - 3}`}
                            </Typography>
                        ) : null}
                    </div>
                    <div className={classes.info}>
                        <div className={classes.nameRow}>
                            <Typography ref={nameRef} className={classes.name} variant="body2">
                                {collection.name}
                            </Typography>
                            {verifiedBy?.length ? (
                                <ShadowRootTooltip
                                    disableInteractive
                                    title={t.verified_by({ marketplace: verifiedBy.join(', ') })}>
                                    <Icons.Verification size={16} />
                                </ShadowRootTooltip>
                            ) : null}
                        </div>
                        <Typography className={classes.tokenId} variant="body2" component="div">
                            {collection?.symbol || ''}
                        </Typography>
                    </div>
                </div>
            </ShadowRootTooltip>
        )
    },
)

Collection.displayName = 'Collection'

export interface CollectionSkeletonProps extends HTMLProps<HTMLDivElement> {
    id: string
    /** Render variants according to count */
    count: number
    expanded?: boolean
}
export function CollectionSkeleton({ className, count, id, expanded, ...rest }: CollectionSkeletonProps) {
    const { compact, containerRef } = useCompactDetection()
    const { classes, cx } = useStyles({ compact })

    // We render up to 4 skeletons unless it's expanded.
    const renderCount = expanded ? count : Math.min(4, count)
    const asFolder = renderCount > 2 && !expanded

    const skeletons = range(renderCount).map((i) => <CollectibleItemSkeleton omitInfo={asFolder} key={`${id}.${i}`} />)

    if (asFolder)
        return (
            <div className={cx(className, classes.folder)} ref={containerRef} {...rest}>
                <div className={classes.grid}>{skeletons}</div>
                <div className={classes.info}>
                    {expanded ? null : (
                        <Typography className={classes.name} color="textPrimary" variant="body2">
                            <Skeleton animation="wave" variant="text" width="80%" />
                        </Typography>
                    )}
                    <Typography className={classes.tokenId} variant="body2" component="div">
                        <Skeleton animation="wave" variant="text" width="40%" />
                    </Typography>
                </div>
            </div>
        )
    return <>{skeletons}</>
}

export const LazyCollection = memo((props: CollectionProps) => {
    const { className, collection } = props
    const placeholderRef = useRef<HTMLDivElement>(null)
    const [seen, setSeen] = useState(false)

    useEffect(() => {
        if (!placeholderRef.current || seen) return
        const observer = new IntersectionObserver(
            (evt) => {
                if (!evt[0].isIntersecting) return
                setSeen(true)
                observer.disconnect()
            },
            { root: null },
        )
        observer.observe(placeholderRef.current)

        return () => {
            observer.disconnect()
        }
    }, [placeholderRef.current, seen])

    if (seen) {
        return <Collection {...props} ref={undefined} />
    }
    return (
        <div className={className} ref={placeholderRef}>
            <CollectionSkeleton className={className} id={collection.id!} count={collection.balance!} />
        </div>
    )
})

LazyCollection.displayName = 'LazyCollection'
