import { memo, type HTMLProps } from 'react'
import { Card, useTheme } from '@mui/material'
import { CheckBoxIndicator, RadioIndicator, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NetworkPluginID } from '@masknet/shared-base'
import { AssetPreviewer, NetworkIcon } from '@masknet/shared'
import { resolveImageURL } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        display: 'block',
        cursor: 'pointer',
    },
    card: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        position: 'absolute',
        zIndex: 1,
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        width: '100%',
        height: '100%',
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 30,
        height: 30,
    },
    fallbackLensImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: '100%',
        height: '100%',
    },
    blocker: {
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
    },
    indicator: {
        padding: 0,
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 1,
    },
}))

export interface CollectibleCardProps extends HTMLProps<HTMLDivElement> {
    pluginID?: NetworkPluginID
    asset: Web3Helper.NonFungibleAssetAll
    disableNetworkIcon?: boolean
    /** disable inspect NFT details */
    disableInspect?: boolean
    isSelected?: boolean
    useRadio?: boolean
    showUnCheckedIndicator?: boolean
}

export const CollectibleCard = memo(
    ({
        className,
        pluginID,
        asset,
        disableNetworkIcon,
        disableInspect,
        isSelected,
        useRadio,
        showUnCheckedIndicator,
        ...rest
    }: CollectibleCardProps) => {
        const { classes, cx } = useStyles()
        const theme = useTheme()

        const icon =
            pluginID && !disableNetworkIcon ? <NetworkIcon pluginID={pluginID} chainId={asset.chainId} /> : null
        const { metadata } = asset
        const url = metadata?.previewImageURL || metadata?.imageURL || metadata?.mediaURL
        const fallbackImage = resolveImageURL(
            undefined,
            asset.metadata?.name,
            asset.collection?.name,
            asset.contract?.address,
        )

        const Indicator = useRadio ? RadioIndicator : CheckBoxIndicator

        return (
            <div className={cx(classes.root, className)} {...rest}>
                <div className={classes.blocker} />
                <Card className={classes.card}>
                    <AssetPreviewer
                        classes={{
                            fallbackImage: fallbackImage ? classes.fallbackLensImage : classes.fallbackImage,
                        }}
                        url={url}
                        icon={icon}
                        fallbackImage={fallbackImage}
                    />
                </Card>
                {isSelected || showUnCheckedIndicator ? (
                    <Indicator
                        size={20}
                        checked={isSelected}
                        className={classes.indicator}
                        checkedButtonColor={theme.palette.maskColor.primary}
                        unCheckedButtonColor={theme.palette.maskColor.secondaryLine}
                    />
                ) : null}
            </div>
        )
    },
)

CollectibleCard.displayName = 'CollectibleCard'
