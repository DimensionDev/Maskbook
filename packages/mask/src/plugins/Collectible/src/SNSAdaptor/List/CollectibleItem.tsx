import { forwardRef, HTMLProps, useRef, useLayoutEffect, useState } from 'react'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
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
    hidden: {
        visibility: 'hidden',
    },
}))

interface CollectibleItemProps extends HTMLProps<HTMLDivElement>, CollectibleCardProps {}

export const CollectibleItem = forwardRef<HTMLDivElement, CollectibleItemProps>((props: CollectibleItemProps, ref) => {
    const { className, asset, pluginID, ...rest } = props
    const { classes, cx } = useStyles()
    const name = asset.metadata?.name ?? ''
    const textRef = useRef<HTMLDivElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)
    useLayoutEffect(() => {
        if (textRef.current) {
            setShowTooltip(textRef.current.offsetWidth !== textRef.current.scrollWidth)
        }
    }, [textRef.current])

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
                <CollectibleCard className={classes.collectibleCard} pluginID={pluginID} asset={asset} />
                <div className={cx(classes.description, name ? '' : classes.hidden)}>
                    <Typography ref={textRef} className={classes.name} color="textPrimary" variant="body2">
                        {name}
                    </Typography>
                </div>
            </div>
        </ShadowRootTooltip>
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
