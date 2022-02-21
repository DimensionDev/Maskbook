import { useSocket } from '../hooks/useSocket'
import type { ERC721TokenCollectionInfo } from '../web3-token-types'

export function useNonFungibleAssetCollections(address: string, chainId: number | null, dependReady?: boolean) {
    const id = `mask.fetchNonFungibleCollectionAsset_${address}_${chainId}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectionAsset',
        params: {
            address: address,
            pageSize: 200,
        },
    }
    return useSocket<ERC721TokenCollectionInfo>(message)
}
