import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export function useCollectibles() {
    const {
        value: assets = [],
        error,
        retry,
        loading,
    } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, SchemaType.ERC721)

    const collectibles = assets.map((x) => {
        return {
            contract: x.contract,
            metadata: x.metadata,
            tokenId: x.id,
        } as NonFungibleToken<ChainId, SchemaType>
    })
    console.log(assets)
    return { collectibles, error, retry, loading }
}
