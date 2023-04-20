import { CrossIsolationMessages } from '@masknet/shared-base'
import { ShadowRootTooltip, makeStyles, useDetectOverflow } from '@masknet/theme'
import { isLensCollect, isLensFollower, isXnsContractAddress } from '@masknet/web3-shared-evm'
import { Skeleton, Typography } from '@mui/material'
import { forwardRef, memo, useCallback, useMemo, type HTMLProps } from 'react'
import { CollectibleCard, type CollectibleCardProps } from './CollectibleCard.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 0,
    },
    fadeIn: {
        '@keyframes fade-in': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
        },
        animation: 'fade-in 500ms ease-in-out',
    },
    collectibleCard: {
        width: '100%',
        aspectRatio: '1/1',
    },
    info: {
        padding: theme.spacing('6px', '2px', '6px', '6px'),
        overflow: 'auto',
        boxSizing: 'border-box',
        width: '100%',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: theme.spacing(2),
        minHeight: theme.spacing(2),
        color: theme.palette.maskColor.second,
    },
    identity: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: theme.spacing(2),
        minHeight: theme.spacing(2),
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    hidden: {
        visibility: 'hidden',
    },
}))

interface CollectibleItemProps extends HTMLProps<HTMLDivElement>, CollectibleCardProps {
    disableName?: boolean
}

export const CollectibleItem = memo(
    forwardRef<HTMLDivElement, CollectibleItemProps>((props: CollectibleItemProps, ref) => {
        const { className, asset, pluginID, disableNetworkIcon, disableName, ...rest } = props
        const { classes, cx } = useStyles()
        const name = asset.collection?.name ?? ''

        const handleClick = useCallback(() => {
            if (!asset.chainId || !pluginID) return
            CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
                open: true,
                chainId: asset.chainId,
                pluginID,
                tokenId: asset.tokenId,
                tokenAddress: asset.address,
            })
        }, [pluginID, asset.chainId, asset.tokenId, asset.address])

        const identity = useMemo(() => {
            if (!asset.collection) return
            if (isLensCollect(asset.collection.name) || isLensFollower(asset.collection.name))
                return asset.collection.name
            if (isXnsContractAddress(asset.address)) return asset.metadata?.name
            return asset.tokenId ? `#${asset.tokenId}` : ''
        }, [asset.collection])

        const [nameOverflow, nameRef] = useDetectOverflow()
        const [identityOverflow, identityRef] = useDetectOverflow()
        const tooltip =
            nameOverflow || identityOverflow ? (
                <Typography>
                    {disableName ? null : <div>{name}</div>}
                    {identity}
                </Typography>
            ) : undefined

        return (
            <ShadowRootTooltip title={tooltip} placement="top" disableInteractive arrow>
                <div className={cx(classes.card, className, classes.fadeIn)} {...rest} ref={ref}>
                    <CollectibleCard
                        className={classes.collectibleCard}
                        pluginID={pluginID}
                        asset={asset}
                        disableNetworkIcon={disableNetworkIcon}
                        onClick={handleClick}
                    />
                    <div className={cx(classes.info, name ? '' : classes.hidden)}>
                        {disableName ? null : (
                            <Typography ref={nameRef} className={classes.name} variant="body2">
                                {name}
                            </Typography>
                        )}
                        <Typography ref={identityRef} className={classes.identity} variant="body2" component="div">
                            {identity}
                        </Typography>
                    </div>
                </div>
            </ShadowRootTooltip>
        )
    }),
)

CollectibleItem.displayName = 'collectibleItem'

export interface CollectibleItemSkeletonProps extends HTMLProps<HTMLDivElement> {
    omitInfo?: boolean
    omitName?: boolean
}

export function CollectibleItemSkeleton({ className, omitInfo, omitName, ...rest }: CollectibleItemSkeletonProps) {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.card, className)} {...rest}>
            <div className={classes.collectibleCard}>
                <Skeleton animation="wave" variant="rectangular" height="100%" />
            </div>
            {omitInfo ? null : (
                <div className={classes.info}>
                    {omitName ? null : (
                        <Typography className={classes.name} variant="body2">
                            <Skeleton animation="wave" variant="text" width="80%" />
                        </Typography>
                    )}
                    <Typography className={classes.identity} variant="body2" component="div">
                        <Skeleton animation="wave" variant="text" width={'40%'} />
                    </Typography>
                </div>
            )}
        </div>
    )
}
