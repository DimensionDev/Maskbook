import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { ChainId as SolChainId, SchemaType as SolSchemaType } from '@masknet/web3-shared-solana'

export function useCollectibles(account: string, pluginId: NetworkPluginID, chainId: ChainId | SolChainId) {
    const isSolana = pluginId === NetworkPluginID.PLUGIN_SOLANA
    const {
        value: assets = [],
        error,
        retry,
        loading,
    } = useNonFungibleAssets(pluginId, isSolana ? SolSchemaType.NonFungible : SchemaType.ERC721, {
        chainId,
        account,
        // account: '2qZeMst5bcSjNQJKbdNAczEw5XJ8UHvYD2uW6kSWvVde',
    })

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
