import { NetworkPluginID, type StorageObject } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { isSameAddress, type FungibleToken, type NonFungibleToken } from '@masknet/web3-shared-base'
import {
    formatEthereumAddress,
    isValidAddress,
    isValidChainId,
    type ChainId,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import type { Subscription } from 'use-subscription'
import { TokenState, type TokenStorage } from '../../Base/state/Token.js'
import { EVMHub } from '../apis/HubAPI.js'
import { EVMChainResolver } from '../apis/ResolverAPI.js'

export class EVMToken extends TokenState<ChainId, SchemaType> {
    private Hub = EVMHub

    constructor(
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
        storage: StorageObject<TokenStorage<ChainId, SchemaType>>,
    ) {
        super(storage, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }

    private async getStoredFungibleTokens(chainId: ChainId) {
        const storedTokensMap = this.storage.credibleFungibleTokenList.value
        const storedTokens = storedTokensMap[chainId]
        if (storedTokens) return storedTokens
        return queryClient.fetchQuery({
            // eslint-disable-next-line @tanstack/query/exhaustive-deps
            queryKey: ['evm', 'get-fungible-token-list', chainId],
            queryFn: async () => {
                const fungibleTokenList = await this.Hub.getFungibleTokensFromTokenList(chainId)
                // No need to wait for storage
                this.storage.credibleFungibleTokenList.setValue({
                    ...storedTokensMap,
                    [chainId]:
                        fungibleTokenList.length ? fungibleTokenList : [EVMChainResolver.nativeCurrency(chainId)],
                })
                return fungibleTokenList
            },
        })
    }

    async createFungibleToken(
        chainId: ChainId,
        address: string,
        token?: FungibleToken<ChainId, SchemaType>,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId) || !address) return

        const fungibleTokens = await this.getStoredFungibleTokens(chainId)
        const credibleToken = fungibleTokens.find((x) => isSameAddress(x.address, address))

        return credibleToken ?? token
    }

    async createNonFungibleToken(
        chainId: ChainId,
        address: string,
        token?: NonFungibleToken<ChainId, SchemaType>,
    ): Promise<NonFungibleToken<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId) || !address) return

        const nonFungibleTokenListFromStorage = this.storage.credibleNonFungibleTokenList.value
        const nonFungibleTokenListByChainFromStorage = nonFungibleTokenListFromStorage?.[chainId]

        if (!nonFungibleTokenListByChainFromStorage) {
            const nonFungibleTokenList = await this.Hub.getNonFungibleTokensFromTokenList(chainId, { chainId })
            await this.storage.credibleNonFungibleTokenList.setValue({
                ...nonFungibleTokenListFromStorage,
                [chainId]: nonFungibleTokenList,
            })

            const credibleToken = nonFungibleTokenList?.find((x) => isSameAddress(x.address, address))
            return credibleToken ?? token
        }

        const credibleToken = nonFungibleTokenListByChainFromStorage.find((x) => isSameAddress(x.address, address))
        return credibleToken ?? token
    }
}
