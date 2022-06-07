import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { CollectibleTab, CollectibleToken } from '../types'
import { useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

function useCollectibleState(token?: CollectibleToken) {
    const [tabIndex, setTabIndex] = useState(CollectibleTab.ARTICLE)
    const [provider, setProvider] = useState(SourceType.OpenSea)

    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, token?.contractAddress ?? '', token?.tokenId ?? '', {
        sourceType: provider,
    })

    return {
        token,
        asset,
        provider,
        setProvider,

        tabIndex,
        setTabIndex,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
