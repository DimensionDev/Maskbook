import type { FC } from 'react'
import { useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { AssetPreviewer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    fallbackImage: {
        width: 64,
        height: 64,
    },
}))

export interface NFTItemProps {
    asset: Web3Helper.NonFungibleAssetScope<'all'>
}

export const NFTItem: FC<NFTItemProps> = ({ asset }) => {
    const { classes } = useStyles()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()

    return (
        <AssetPreviewer
            classes={{
                fallbackImage: classes.fallbackImage,
            }}
            pluginID={pluginID}
            chainId={chainId}
            url={asset.metadata?.imageURL}
        />
    )
}
