import type { ERC721TokenDetailed } from '../web3-token-types'
import { useSocket } from '../hooks/useSocket'

export function useNonFungibleAssets(address: string, chainId: number | null, dependReady?: boolean) {
    const id = `mask.fetchNonFungibleCollectibleAsset_${address}_${chainId}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectibleAsset',
        params: {
            address: address,
            pageSize: 30,
        },
    }

    return useSocket<ERC721TokenDetailed>(message)
}
