import { Icons } from '@masknet/icons'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Skeleton, Typography } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useEffect, useRef, useState, type FC, type HTMLProps } from 'react'
import { useI18N } from '../../locales/i18n_generated.js'
import { CollectibleCard } from './CollectibleCard.js'
import { CollectibleItem, CollectibleItemSkeleton } from './CollectibleItem.js'
import { useCompactDetection } from './useCompactDetection.js'

const useStyles = makeStyles<{ compact?: boolean }>()((theme, { compact }) => ({
    folder: {
        overflow: 'auto',
        cursor: 'pointer',
        container: 'folder',
    },
    grid: {
        display: 'grid',
        overflow: 'auto',
        gridTemplateColumns: 'repeat(2, 1fr)',
        // TODO Unfortunately, we can't use @container query in shadow DOM yet.
        gridGap: theme.spacing(compact ? 0.5 : 1),
        padding: theme.spacing(compact ? 0.5 : 1),
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 8,
        aspectRatio: '1 / 1',
        cursor: 'pointer',
    },
    info: {
        background: theme.palette.maskColor.bg,
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
        padding: theme.spacing('6px', '2px', '6px', '6px'),
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
        lineHeight: '16px',
        minHeight: '16px',
        textIndent: '8px',
        color: theme.palette.maskColor.second,
    },
    tokenId: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '16px',
        minHeight: '16px',
        textIndent: '8px',
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

export interface CollectionProps extends HTMLProps<HTMLDivElement> {
    pluginID: NetworkPluginID
    owner: string
    collection: Web3Helper.NonFungibleCollectionAll
    assets: Web3Helper.NonFungibleAssetScope[]
    loading: boolean
    verifiedBy: string[]
    /** set collection expanded */
    expanded?: boolean
    onExpand?(id: string): void
    onRender?(collection: Web3Helper.NonFungibleCollectionAll): void
}

/**
 * Props inherited from div on take effect when rendering as a folder
 */
export const Collection: FC<CollectionProps> = memo(
    ({
        className,
        collection,
        owner,
        pluginID,
        loading,
        assets = EMPTY_LIST,
        verifiedBy,
        expanded,
        onExpand,
        onRender,
        ...rest
    }) => {
        const t = useI18N()
        const { compact, containerRef } = useCompactDetection()
        const { classes, cx } = useStyles({ compact })

        useEffect(() => {
            onRender?.(collection)
        }, [onRender, collection])

        if (loading && !assets.length) {
            return <CollectionSkeleton id={collection.id!} count={collection.balance!} expanded={expanded} />
        }

        const hasExtra = collection.balance! > 4 && !expanded
        const assetsSlice = hasExtra ? assets.slice(0, 3) : assets

        if (assetsSlice.length <= 2 || expanded) {
            const renderAssets = assetsSlice.map((asset) => (
                <CollectibleItem
                    className={className}
                    asset={asset}
                    pluginID={pluginID}
                    disableName={expanded}
                    key={`${collection.id}.${asset.tokenId}`}
                />
            ))
            return <>{renderAssets}</>
        }

        const renderAssets = assetsSlice.map((asset) => (
            <CollectibleCard
                className={classes.collectibleCard}
                asset={asset}
                pluginID={pluginID}
                key={`${collection.id}.${asset.tokenId}`}
                disableNetworkIcon
            />
        ))
        return (
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
                            +{Math.min(collection.balance! - 3, 999)}
                        </Typography>
                    ) : null}
                </div>
                <div className={classes.info}>
                    <div className={classes.nameRow}>
                        <Typography className={classes.name} variant="body2">
                            {collection.name}
                        </Typography>
                        {verifiedBy?.length ? (
                            <ShadowRootTooltip title={t.verified_by({ marketplace: verifiedBy.join(', ') })}>
                                <Icons.Verification size={16} />
                            </ShadowRootTooltip>
                        ) : null}
                    </div>
                    <Typography className={classes.tokenId} variant="body2" component="div">
                        {collection?.symbol || ''}
                    </Typography>
                </div>
            </div>
        )
    },
)

Collection.displayName = 'Collection'

export interface CollectionSkeletonProps extends HTMLProps<HTMLDivElement> {
    /** Render variants according to count */
    count: number
    id: string
    expanded?: boolean
}
export const CollectionSkeleton: FC<CollectionSkeletonProps> = ({ className, count, id, expanded, ...rest }) => {
    const { compact, containerRef } = useCompactDetection()
    const { classes, cx } = useStyles({ compact })

    // We render up to 4 skeletons unless it's expanded.
    const renderCount = expanded ? count : Math.min(4, count)
    const renderAsFolder = renderCount > 2 && !expanded

    const skeletons = range(renderCount).map((i) => (
        <CollectibleItemSkeleton omitInfo={renderAsFolder} key={`${id}.${i}`} />
    ))

    if (renderAsFolder)
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

export const LazyCollection: FC<CollectionProps> = memo((props) => {
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
        return <Collection {...props} />
    }
    return (
        <div className={className} ref={placeholderRef}>
            <CollectionSkeleton className={className} id={collection.id!} count={collection.balance!} />
        </div>
    )
})

LazyCollection.displayName = 'LazyCollection'
