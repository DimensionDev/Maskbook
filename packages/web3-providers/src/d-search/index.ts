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
import { ChainId, AddressType } from '@masknet/web3-shared-evm'
import type { DSearchBaseAPI } from '../types/DSearch.js'

const CHAIN_ID_LIST = [ChainId.Mainnet, ChainId.BSC, ChainId.Matic]
export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType>
{
    async search(
        keyword: string,
        helpers: {
            isValidAddress: (address?: string) => boolean
            isZeroAddress: (address?: string) => boolean
            isValidDomain: (domain?: string) => boolean
            getAddressType: (
                address: string,
                options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID>,
            ) => Promise<AddressType | undefined>
        },
        sourceType?: SearchSourceType,
    ): Promise<SearchResult<ChainId, SchemaType>> {
        const { isValidAddress, isZeroAddress, isValidDomain, getAddressType } = helpers

        if (isValidDomain(keyword)) {
            return {
                type: SearchResultType.Domain,
                chainId: ChainId.Mainnet,
                domain: keyword,
                keyword,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            } as DomainResult<ChainId>
        }

        if (isValidAddress(keyword) && !isZeroAddress(keyword)) {
            const result = await attemptUntil(
                CHAIN_ID_LIST.map((chainId) => async () => {
                    const addressType = await getAddressType(keyword, { chainId })
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
            chainId: ChainId.Mainnet,
            type: SearchResultType.FungibleToken,
            address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
            keyword,
        }) as Promise<SearchResult<ChainId, SchemaType>>
    }
}
