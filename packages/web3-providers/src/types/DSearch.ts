import type { SearchResult } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { AddressType } from '@masknet/web3-shared-evm'
import type { NetworkPluginID } from '@masknet/shared-base'

export namespace DSearchBaseAPI {
    export interface Provider<ChainId, SchemaType, T extends NetworkPluginID> {
        search(
            keyword: string,
            options: {
                getAddressType?: (
                    address: string,
                    options?: Web3Helper.Web3ConnectionOptions<T>,
                ) => Promise<AddressType | undefined>
            },
        ): Promise<Array<SearchResult<ChainId, SchemaType>>>
    }

    export interface DataSourceProvider<ChainId, NewType> {
        get(): Promise<Array<SearchResult<ChainId, NewType>>>
    }
}
