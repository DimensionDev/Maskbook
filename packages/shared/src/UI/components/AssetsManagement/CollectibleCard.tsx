import { memo, type HTMLProps, type FC } from 'react'
import { Card } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { AssetPreviewer, NetworkIcon } from '@masknet/shared'
import { resolveImageURL } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

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
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
        color: theme.palette.maskColor.primary,
        zIndex: 1,
    },
}))

export interface CollectibleCardProps extends HTMLProps<HTMLDivElement> {
    pluginID?: NetworkPluginID
    asset: Web3Helper.NonFungibleAssetAll
    disableNetworkIcon?: boolean
    /** disable inspect NFT details */
    disableInspect?: boolean
    selectedAsset?: Web3Helper.NonFungibleAssetAll
}

export function isSameNFT(
    pluginID: NetworkPluginID,
    a: Web3Helper.NonFungibleAssetAll,
    b?: Web3Helper.NonFungibleAssetAll,
): boolean {
    return pluginID !== NetworkPluginID.PLUGIN_SOLANA
        ? isSameAddress(a.contract?.address, b?.contract?.address) &&
              a.contract?.chainId === b?.contract?.chainId &&
              a.tokenId === b?.tokenId
        : a.tokenId === b?.tokenId && a.id === b.id
}

export const CollectibleCard: FC<CollectibleCardProps> = memo(
    ({ className, pluginID, asset, disableNetworkIcon, disableInspect, ...rest }) => {
        const { classes, cx } = useStyles()

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
        const selected = isSameNFT(pluginID ?? NetworkPluginID.PLUGIN_EVM, asset, rest.selectedAsset)

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
                {selected ? <Icons.CheckCircle className={classes.icon} size={24} /> : null}
            </div>
        )
    },
)

CollectibleCard.displayName = 'CollectibleCard'
