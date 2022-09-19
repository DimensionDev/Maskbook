import { useState } from 'react'
import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../../types'
import { useNonFungibleOrders } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ENS_CONTRACT_ADDRESS } from '../../constants.js'

function useCollectibleState(token?: CollectibleToken) {
    const [sourceType, setSourceType] = useState(SourceType.OpenSea)

    const orders = useNonFungibleOrders(NetworkPluginID.PLUGIN_EVM, ENS_CONTRACT_ADDRESS, token?.tokenId ?? '', {
        chainId: ChainId.Mainnet,
        sourceType,
    })

    return {
        token,
        orders,
        sourceType,
        setSourceType,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
