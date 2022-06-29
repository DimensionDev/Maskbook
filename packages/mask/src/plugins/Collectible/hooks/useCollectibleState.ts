import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { CollectibleTab, CollectibleToken } from '../types'
import { useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'

function useCollectibleState(token?: CollectibleToken) {
    const [tabIndex, setTabIndex] = useState(CollectibleTab.ARTICLE)
    const [provider, setProvider] = useState(token?.provider ?? SourceType.OpenSea)

    const asset = useNonFungibleAsset(
        token?.provider === SourceType.MagicEden ? NetworkPluginID.PLUGIN_SOLANA : NetworkPluginID.PLUGIN_EVM,
        token?.contractAddress ?? '',
        token?.tokenId ?? '',
        {
            sourceType: provider,
            chainId: token?.provider === SourceType.MagicEden ? ChainId.Mainnet : SolanaChainId.Mainnet,
        },
    )

    return {
        token,
        asset,
        provider,
        tabIndex,
        setProvider,
        setTabIndex,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
