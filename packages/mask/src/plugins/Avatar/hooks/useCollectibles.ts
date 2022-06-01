import { useCurrentWeb3NetworkPluginID, useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export function useCollectibles(chainId: ChainId) {
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const {
        value: assets = [],
        error,
        retry,
        loading,
    } = useNonFungibleAssets(currentPluginId, SchemaType.ERC721, { chainId })

    const collectibles = assets.map((x) => {
        return {
            contract: x.contract,
            metadata: x.metadata,
            collection: x.collection,
            tokenId: x.tokenId,
        } as NonFungibleToken<ChainId, SchemaType>
    })
    return { collectibles, error, retry, loading }
}
