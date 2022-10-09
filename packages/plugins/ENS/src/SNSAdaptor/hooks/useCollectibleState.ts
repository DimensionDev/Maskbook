import { useState } from 'react'
import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../../types'
import { useNonFungibleOrders } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ENS_CONTRACT_ADDRESS } from '../../constants.js'

function useCollectibleState(token?: CollectibleToken) {
    const [sourceType, setSourceType] = useState(SourceType.OpenSea)

    const orders = useNonFungibleOrders(NetworkPluginID.PLUGIN_EVM, ENS_CONTRACT_ADDRESS, token?.tokenId ?? '', {
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
