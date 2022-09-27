import { useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { Checkbox, Radio, Skeleton, Typography } from '@mui/material'
import { forwardRef, HTMLProps, memo } from 'react'
import { CollectibleCard, CollectibleCardProps } from './CollectibleCard.js'

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
        '& [data-icon]': {
            width: 20,
            height: 20,
        },
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

export const CollectibleItem = memo(
    forwardRef<HTMLDivElement, CollectibleItemProps>((props: CollectibleItemProps, ref) => {
        const {
            provider,
            asset,
            readonly,
            renderOrder,
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
            ...rest
        } = props
        const { classes, cx } = useStyles()
        const { Others } = useWeb3State()

        const uiTokenId = Others?.formatTokenId(asset.tokenId, 4)

        const SelectableButton = selectable && multiple ? Checkbox : Radio

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
                ref={ref}>
                <CollectibleCard
                    className={classes.collectibleCard}
                    asset={asset}
                    provider={provider}
                    readonly={readonly}
                    renderOrder={renderOrder}
                    pluginID={pluginID}
                    showNetworkIcon={showNetworkIcon}
                    disableLink={disableLink || selectable}
                />
                {uiTokenId ? (
                    <div className={classes.description}>
                        <Typography className={classes.name} color="textPrimary" variant="body2">
                            {uiTokenId}
                        </Typography>
                    </div>
                ) : null}
                {selectable ? <SelectableButton className={classes.select} value={value} checked={!!checked} /> : null}
            </div>
        )
    }),
)

interface SkeletonProps extends HTMLProps<HTMLDivElement> {}
export function CollectibleItemSkeleton({ className, ...rest }: SkeletonProps) {
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
