import { type HTMLProps } from 'react'
import { Card } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NetworkPluginID } from '@masknet/shared-base'
import { AssetPreviewer, NetworkIcon } from '@masknet/shared'

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
    blocker: {
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
    },
}))

export interface CollectibleCardProps extends HTMLProps<HTMLDivElement> {
    pluginID?: NetworkPluginID
    asset: Web3Helper.NonFungibleAssetAll
    disableNetworkIcon?: boolean
    /** disable inspect NFT details */
    disableInspect?: boolean
}

export function CollectibleCard({
    className,
    pluginID,
    asset,
    disableNetworkIcon,
    disableInspect,
    ...rest
}: CollectibleCardProps) {
    const { classes, cx } = useStyles()

    const icon = pluginID && !disableNetworkIcon ? <NetworkIcon pluginID={pluginID} chainId={asset.chainId} /> : null
    const { metadata } = asset
    const url = metadata?.previewImageURL || metadata?.imageURL || metadata?.mediaURL

    return (
        <div className={cx(classes.root, className)} {...rest}>
            <div className={classes.blocker} />
            <Card className={classes.card}>
                <AssetPreviewer
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                    url={url}
                    icon={icon}
                />
            </Card>
        </div>
    )
}
