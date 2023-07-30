import { ShadowRootTooltip, makeStyles, useDetectOverflow } from '@masknet/theme'
import { isLens, isLensCollect, isLensFollower, isXnsContractAddress } from '@masknet/web3-shared-evm'
import { Button, Skeleton, Typography } from '@mui/material'
import { forwardRef, memo, useCallback, useMemo, type HTMLProps } from 'react'
import { CollectibleCard, type CollectibleCardProps } from './CollectibleCard.js'
import { Icons } from '@masknet/icons'
import { useSharedI18N } from '../../../index.js'
import { EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles<void, 'action' | 'collectibleCard' | 'info'>()((theme, _, refs) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        overflow: 'visible',
        zIndex: 0,
    },
    withAction: {
        '&:hover': {
            transform: 'translateY(19px)',
            transitionDuration: '150ms',
            [`.${refs.action}`]: {
                marginTop: 8,
                opacity: 1,
            },
            [`.${refs.collectibleCard}`]: {
                transform: 'translateY(-38px)',
            },
            [`.${refs.info}`]: {
                transform: 'translateY(-38px)',
            },
        },
    },
    ease: {
        transition: 'all 300ms ease',
    },
    fadeIn: {
        '@keyframes fade-in': {
            '0%': { opacity: 0 },
        },
        animation: 'fade-in 500ms ease-in-out',
    },
    collectibleCard: {
        width: '100%',
        aspectRatio: '1/1',
    },
    info: {
        padding: 6,
        overflow: 'auto',
        boxSizing: 'border-box',
        width: '100%',
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
    identity: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: theme.spacing(2),
        minHeight: theme.spacing(2),
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    action: {
        width: '100%',
        padding: theme.spacing(0, 1),
        boxSizing: 'border-box',
        textAlign: 'center',
        opacity: 0,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 6,
    },
    actionButton: {
        borderRadius: 28,
        backgroundColor: theme.palette.maskColor.primary,
        color: '#fff',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.primary,
        },
    },
}))

export interface CollectibleItemProps extends HTMLProps<HTMLDivElement>, CollectibleCardProps {
    disableName?: boolean
    /** @default true */
    disableAction?: boolean
    actionLabel?: string
    verifiedBy?: string[]
    onActionClick?(asset: CollectibleCardProps['asset']): void
    onItemClick?(asset: CollectibleCardProps['asset']): void
}

export const CollectibleItem = memo(
    forwardRef<HTMLDivElement, CollectibleItemProps>((props, ref) => {
        const {
            className,
            asset,
            pluginID,
            disableNetworkIcon,
            disableName,
            disableAction = true,
            actionLabel,
            verifiedBy = EMPTY_LIST,
            onActionClick,
            onItemClick,
            indicatorIcon,
            isSelected,
            ...rest
        } = props
        const t = useSharedI18N()
        const { classes, cx } = useStyles()
        const name = asset.collection?.name ?? ''

        const handleClick = useCallback(() => {
            onItemClick?.(asset)
        }, [onItemClick, asset])

        const identity = useMemo(() => {
            if (!asset.collection) return
            if (isLensCollect(asset.collection.name)) return asset.metadata?.name
            if (isLensFollower(asset.collection.name)) return asset.collection.name
            if (isLens(asset.metadata?.name)) return asset.metadata?.name
            if (isXnsContractAddress(asset.address)) return asset.metadata?.name
            return asset.metadata?.name || (asset.tokenId ? `#${asset.tokenId}` : '')
        }, [asset])

        const [nameOverflow, nameRef] = useDetectOverflow()
        const [identityOverflow, identityRef] = useDetectOverflow()
        const tooltip =
            nameOverflow || identityOverflow ? (
                <Typography component="div">
                    {disableName ? null : <div>{name}</div>}
                    {identity}
                </Typography>
            ) : undefined

        return (
            <ShadowRootTooltip title={tooltip} placement="top" disableInteractive arrow>
                <div
                    className={cx(classes.card, classes.fadeIn, className, disableAction ? null : classes.withAction)}
                    {...rest}
                    ref={ref}>
                    <CollectibleCard
                        className={cx(classes.collectibleCard, classes.ease)}
                        pluginID={pluginID}
                        asset={asset}
                        disableNetworkIcon={disableNetworkIcon}
                        onClick={handleClick}
                        indicatorIcon={indicatorIcon}
                        isSelected={isSelected}
                    />
                    <div className={cx(classes.info, classes.ease)}>
                        {disableName ? null : (
                            <div className={classes.nameRow}>
                                <Typography ref={nameRef} className={classes.name} variant="body2">
                                    {name || identity}
                                </Typography>

                                {verifiedBy.length ? (
                                    <ShadowRootTooltip title={t.verified_by({ marketplace: verifiedBy.join(', ') })}>
                                        <Icons.Verification size={16} />
                                    </ShadowRootTooltip>
                                ) : null}
                            </div>
                        )}
                        <Typography ref={identityRef} className={classes.identity} variant="body2" component="div">
                            {name ? identity : `#${asset.tokenId}`}
                        </Typography>
                    </div>
                    {disableAction ? null : (
                        <div className={cx(classes.action, classes.ease)}>
                            <Button
                                fullWidth
                                variant="text"
                                className={classes.actionButton}
                                size="small"
                                onClick={() => onActionClick?.(asset)}>
                                {actionLabel}
                            </Button>
                        </div>
                    )}
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

export const CollectibleItemSkeleton = memo(
    forwardRef<HTMLDivElement, CollectibleItemSkeletonProps>(function CollectibleItemSkeleton(
        { className, omitInfo, omitName, ...rest },
        ref,
    ) {
        const { classes, cx } = useStyles()
        return (
            <div className={cx(classes.card, className)} {...rest} ref={ref}>
                <div className={classes.collectibleCard}>
                    <Skeleton animation="wave" variant="rectangular" sx={{ borderRadius: '8px' }} height="100%" />
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
    }),
)
