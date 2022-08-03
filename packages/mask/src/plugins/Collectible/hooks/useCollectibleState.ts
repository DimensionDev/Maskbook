import { useState } from 'react'
import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../types'
import { useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

function useCollectibleState(token?: CollectibleToken) {
    const [provider, setProvider] = useState(token?.provider ?? SourceType.OpenSea)

    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, token?.contractAddress ?? '', token?.tokenId ?? '', {
        sourceType: provider,
        chainId: ChainId.Mainnet,
    })

    return {
        token,
        asset,
        provider,
        setProvider,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
