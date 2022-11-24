import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    SearchResult,
    SearchResultType,
    SearchSourceType,
    DomainResult,
    EOAResult,
    attemptUntil,
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
            lookup?: (chainId: ChainIdEVM, domain: string) => Promise<string | undefined>
            reverse?: (chainId: ChainIdEVM, address: string) => Promise<string | undefined>
        },
        sourceType?: SearchSourceType,
    ): Promise<SearchResult<ChainId, SchemaType>> {
        const { isValidAddress, isZeroAddress, isValidDomain, getAddressType, lookup, reverse } = helpers
        console.log({ keyword })
        if (isValidDomain?.(keyword)) {
            const address = await lookup?.(ChainIdEVM.Mainnet, keyword)

            return {
                type: SearchResultType.Domain,
                domain: keyword,
                address,
                keyword,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            } as DomainResult<ChainId>
        }

        if (isValidAddress?.(keyword) && !isZeroAddress?.(keyword)) {
            const addressType = await attemptUntil(
                CHAIN_ID_LIST.map((chainId) => async () => {
                    const addressType = await getAddressType?.(keyword, { chainId })
                    if (addressType !== AddressType.Contract) return
                    return addressType
                }),
                undefined,
            )

            if (addressType !== AddressType.Contract) {
                const domain = await reverse?.(ChainIdEVM.Mainnet, keyword)
                return {
                    type: SearchResultType.EOA,
                    address: keyword,
                    domain,
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
