import { forwardRef, HTMLProps, useEffect, useRef } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import { CollectibleCard, CollectibleCardProps } from './CollectibleCard.js'

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
        height: '100%',
        aspectRatio: '1/1',
    },
    description: {
        background: theme.palette.maskColor.bg,
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        minHeight: '1em',
        textIndent: '8px',
    },
}))

interface CollectibleItemProps extends HTMLProps<HTMLDivElement>, CollectibleCardProps {
    showTooltip?: (show: boolean) => void
}

export const CollectibleItem = forwardRef<HTMLDivElement, CollectibleItemProps>((props: CollectibleItemProps, ref) => {
    const { className, asset, pluginID, showTooltip, ...rest } = props
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()
    const textRef = useRef<HTMLDivElement>(null)
    const name = asset.contract?.name || asset.metadata?.name
    const uiTokenId = Others?.formatTokenId(asset.tokenId, 4) ?? `#${asset.tokenId}`
    const title = name ? `${name} ${uiTokenId}` : asset.metadata?.name ?? ''

    useEffect(() => {
        if (!textRef.current) return
        showTooltip?.(textRef.current.offsetWidth !== textRef.current.scrollWidth)
    }, [textRef.current])

    return (
        <div className={cx(classes.card, className)} {...rest} ref={ref}>
            <CollectibleCard className={classes.collectibleCard} pluginID={pluginID} asset={asset} />
            {title ? (
                <div className={classes.description}>
                    <Typography ref={textRef} className={classes.name} color="textPrimary" variant="body2">
                        {title}
                    </Typography>
                </div>
            ) : null}
        </div>
    )
})

export interface CollectibleItemSkeletonProps extends HTMLProps<HTMLDivElement> {}

export function CollectibleItemSkeleton({ className, ...rest }: CollectibleItemSkeletonProps) {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.card, className)} {...rest}>
            <div className={classes.collectibleCard}>
                <Skeleton animation="wave" variant="rectangular" height="100%" />
            </div>
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    <Skeleton animation="wave" variant="text" height="100%" />
                </Typography>
            </div>
        </div>
    )
}
