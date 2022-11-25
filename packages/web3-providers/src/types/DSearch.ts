import type { SearchResult } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { AddressType } from '@masknet/web3-shared-evm'
import type { NetworkPluginID } from '@masknet/shared-base'

export namespace DSearchBaseAPI {
    export interface Provider<ChainId, T extends NetworkPluginID> {
        search(
            keyword: string,
            options: {
                isValidAddress?: (address?: string) => boolean
                isZeroAddress?: (address?: string) => boolean
                isValidDomain?: (domain?: string) => boolean
                getAddressType?: (
                    address: string,
                    options?: Web3Helper.Web3ConnectionOptions<T>,
                ) => Promise<AddressType | undefined>
            },
        ): Promise<SearchResult<ChainId>>
    }
}
