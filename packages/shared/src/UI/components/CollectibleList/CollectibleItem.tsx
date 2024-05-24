import { type HTMLProps, memo } from 'react'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { makeStyles } from '@masknet/theme'
import { Checkbox, Radio, Skeleton, Typography, useForkRef } from '@mui/material'
import { CollectibleCard, type CollectibleCardProps } from './CollectibleCard.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 0,
        background: theme.palette.maskColor.bg,
        borderRadius: theme.spacing(1),
    },
    inactive: {
        opacity: 0.5,
    },
    selectable: {
        cursor: 'pointer',
    },
    collectibleCard: {
        width: '100%',
        height: '100%',
        aspectRatio: '1/1',
        borderRadius: theme.spacing(1),
        overflow: 'hidden',
    },
    description: {
        alignSelf: 'stretch',
        borderRadius: theme.spacing(0, 0, 1, 1),
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        minHeight: '1em',
        textIndent: '8px',
    },
    select: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 6,
        zIndex: 9,
    },
}))

export interface ChangeEventOptions {
    checked: boolean
    value: string
}

export interface SelectableProps {
    selectable?: boolean
    checked?: boolean
    inactive?: boolean
    multiple?: boolean
    value?: string

    onChange?(options: ChangeEventOptions): void
}

interface CollectibleItemProps
    extends Omit<HTMLProps<HTMLDivElement>, keyof SelectableProps>,
        CollectibleCardProps,
        SelectableProps {}

// TODO lazy render in big list.
export const CollectibleItem = memo(function CollectibleItem(props: CollectibleItemProps) {
    const {
        provider,
        asset,
        pluginID,
        checked,
        inactive,
        selectable,
        multiple,
        value,
        onChange,
        className,
        showNetworkIcon,
        disableLink,
        ref,
        ...rest
    } = props
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils()

    const uiTokenId = Utils.formatTokenId(asset.tokenId, 4)

    const SelectableButton = selectable && multiple ? Checkbox : Radio
    const scrollIntoViewRef = (node: HTMLDivElement) => {
        if (!checked || multiple || !node) return
        node.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
    const forkedRef = useForkRef(ref, scrollIntoViewRef)

    return (
        <div
            className={cx(classes.card, className, {
                [classes.inactive]: inactive,
                [classes.selectable]: selectable,
            })}
            onClick={() => {
                if (selectable) {
                    onChange?.({
                        checked: !checked,
                        value: value!,
                    })
                }
            }}
            {...rest}
            ref={forkedRef}>
            <CollectibleCard
                className={classes.collectibleCard}
                asset={asset}
                provider={provider}
                pluginID={pluginID}
                showNetworkIcon={showNetworkIcon}
                disableLink={disableLink || selectable}
            />
            {asset.metadata?.name || uiTokenId ?
                <div className={classes.description}>
                    <Typography className={classes.name} color="textPrimary" variant="body2">
                        {asset.metadata?.name || uiTokenId}
                    </Typography>
                </div>
            :   null}
            {checked ?
                <SelectableButton className={classes.select} value={value} checked />
            :   null}
        </div>
    )
})

export function CollectibleItemSkeleton(props: HTMLProps<HTMLDivElement>) {
    const { classes, cx } = useStyles()
    return (
        <div {...props} className={cx(classes.card, props.className)}>
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
