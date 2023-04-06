import { forwardRef, type HTMLProps, useRef, useLayoutEffect, useState, useCallback, memo } from 'react'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { Skeleton, Typography } from '@mui/material'
import { CollectibleCard, type CollectibleCardProps } from './CollectibleCard.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 0,
    },
    collectibleCard: {
        width: '100%',
        aspectRatio: '1/1',
    },
    info: {
        background: theme.palette.maskColor.bg,
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
        padding: theme.spacing('6px', '2px', '6px', '6px'),
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
        const name = asset.metadata?.name ?? ''
        const textRef = useRef<HTMLDivElement>(null)
        const [showTooltip, setShowTooltip] = useState(false)
        useLayoutEffect(() => {
            if (textRef.current) {
                setShowTooltip(textRef.current.offsetWidth !== textRef.current.scrollWidth)
            }
        }, [textRef.current])

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

        return (
            <ShadowRootTooltip
                title={showTooltip ? name : undefined}
                placement="top"
                disableInteractive
                arrow
                PopperProps={{
                    disablePortal: true,
                }}>
                <div className={cx(classes.card, className)} {...rest} ref={ref}>
                    <CollectibleCard
                        className={classes.collectibleCard}
                        pluginID={pluginID}
                        asset={asset}
                        disableNetworkIcon={disableNetworkIcon}
                        onClick={handleClick}
                    />
                    <div className={cx(classes.info, name ? '' : classes.hidden)}>
                        {disableName ? null : (
                            <Typography ref={textRef} className={classes.name} variant="body2">
                                {name}
                            </Typography>
                        )}
                        <Typography className={classes.tokenId} variant="body2" component="div">
                            {asset.metadata?.tokenId ? `#${asset.metadata?.tokenId}` : ''}
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
                <Skeleton animation="wave" variant="rounded" style={{ borderRadius: 8 }} height="100%" />
            </div>
            {omitInfo ? null : (
                <div className={classes.info}>
                    {omitName ? null : (
                        <Typography className={classes.name} variant="body2">
                            <Skeleton animation="wave" variant="text" width="80%" />
                        </Typography>
                    )}
                    <Typography className={classes.tokenId} variant="body2" component="div">
                        <Skeleton animation="wave" variant="text" width={'40%'} />
                    </Typography>
                </div>
            )}
        </div>
    )
}
