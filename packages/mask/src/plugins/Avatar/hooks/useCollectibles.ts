import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export function useCollectibles(account: string, pluginId: NetworkPluginID, chainId: ChainId) {
    const {
        value: assets = [],
        error,
        retry,
        loading,
    } = useNonFungibleAssets(pluginId, SchemaType.ERC721, { chainId, account })

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
