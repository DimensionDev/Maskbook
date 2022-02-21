import type { ERC721TokenDetailed } from '../web3-token-types'
import type { Web3Plugin } from '../web3-types'
import { useSocket } from '../hooks/useSocket'

export function useNonFungibleAssets(address: string, network?: Web3Plugin.NetworkDescriptor, dependReady?: boolean) {
    const id = `mask.fetchNonFungibleCollectibleAsset_${address}_${network?.ID ?? 'all'}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectibleAsset',
        params: {
            address: address,
            pageSize: 30,
            network,
        },
    }

    return useSocket<ERC721TokenDetailed>(message)
}
