import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SearchResult, SearchResultType, SearchSourceType } from '@masknet/web3-shared-base'
import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import type { DSearchBaseAPI } from '../types/DSearch.js'

export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType>
{
    search(keyword: string, sourceType?: SearchSourceType): Promise<SearchResult<ChainId, SchemaType>> {
        return Promise.resolve({
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chainId: ChainIdEVM.Mainnet,
            type: SearchResultType.FungibleToken,
            address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
            keyword,
        }) as Promise<SearchResult<ChainId, SchemaType>>
    }
}
