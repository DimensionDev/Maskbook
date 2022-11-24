import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    SearchResult,
    SearchResultType,
    SearchSourceType,
    attemptUntil,
    DomainResult,
    EOAResult,
} from '@masknet/web3-shared-base'
import { ChainId as ChainIdEVM, AddressType } from '@masknet/web3-shared-evm'
import type { DSearchBaseAPI } from '../types/DSearch.js'

const CHAIN_ID_LIST = [ChainIdEVM.Mainnet, ChainIdEVM.BSC, ChainIdEVM.Matic]
export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType, NetworkPluginID.PLUGIN_EVM>
{
    async search(
        keyword: string,
        helpers: {
            isValidAddress?: (address?: string) => boolean
            isZeroAddress?: (address?: string) => boolean
            isValidDomain?: (domain?: string) => boolean
            getAddressType?: (
                address: string,
                options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
            ) => Promise<AddressType | undefined>
        },
        sourceType?: SearchSourceType,
    ): Promise<SearchResult<ChainId, SchemaType>> {
        const { isValidAddress, isZeroAddress, isValidDomain, getAddressType } = helpers

        if (isValidDomain?.(keyword)) {
            return {
                type: SearchResultType.Domain,
                chainId: ChainIdEVM.Mainnet,
                domain: keyword,
                keyword,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            } as DomainResult<ChainId>
        }

        if (isValidAddress?.(keyword) && !isZeroAddress?.(keyword)) {
            const result = await attemptUntil(
                CHAIN_ID_LIST.map((chainId) => async () => {
                    const addressType = await getAddressType?.(keyword, { chainId })
                    if (addressType !== AddressType.Contract) throw new Error('')
                    return { addressType, chainId } as { addressType: AddressType | undefined; chainId: ChainId }
                }),
                undefined,
            )

            if (result && result.addressType !== AddressType.Contract) {
                return {
                    type: SearchResultType.EOA,
                    chainId: result.chainId,
                    address: keyword,
                    keyword,
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                } as EOAResult<ChainId>
            }
        }
        return Promise.resolve({
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chainId: ChainIdEVM.Mainnet,
            type: SearchResultType.FungibleToken,
            address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
            keyword,
        }) as Promise<SearchResult<ChainId, SchemaType>>
    }
}
