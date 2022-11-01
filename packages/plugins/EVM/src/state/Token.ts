import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenState, TokenStorage } from '@masknet/web3-state'
import { R2D2 } from '@masknet/web3-providers'
import { isSameAddress, FungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, isValidAddress, SchemaType, isValidChainId } from '@masknet/web3-shared-evm'

export class Token extends TokenState<ChainId, SchemaType> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue: TokenStorage<ChainId, SchemaType> = {
            fungibleTokenList: {},
            credibleFungibleTokenList: {},
            nonFungibleTokenList: {},
            credibleNonFungibleTokenList: {},
            fungibleTokenBlockedBy: {},
            nonFungibleTokenBlockedBy: {},
        }
        super(context, defaultValue, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }

    override async createFungibleToken(
        chainId: ChainId,
        address: string,
        token?: FungibleToken<ChainId, SchemaType>,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId) || !address) return

        const fungibleTokenListFromStorage = this.storage.credibleFungibleTokenList.value
        const fungibleTokenListByChainFromStorage = fungibleTokenListFromStorage?.[chainId]

        if (!fungibleTokenListByChainFromStorage) {
            const fungibleTokenList = await R2D2.getFungibleTokenList(chainId)
            this.storage.credibleFungibleTokenList.setValue({
                ...fungibleTokenListFromStorage,
                [chainId]: fungibleTokenList,
            })

            const credibleToken = fungibleTokenList.find((x) => isSameAddress(x.address, address))
            return credibleToken ?? token
        }

        const credibleToken = fungibleTokenListByChainFromStorage.find((x) => isSameAddress(x.address, address))
        return credibleToken ?? token
    }

    override async createNonFungibleToken(
        chainId: ChainId,
        address: string,
        token?: NonFungibleToken<ChainId, SchemaType>,
    ): Promise<NonFungibleToken<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId) || !address) return

        const nonFungibleTokenListFromStorage = this.storage.credibleNonFungibleTokenList.value
        const nonFungibleTokenListByChainFromStorage = nonFungibleTokenListFromStorage?.[chainId]

        if (!nonFungibleTokenListByChainFromStorage) {
            const nonFungibleTokenList = await R2D2.getNonFungibleTokenList(chainId)
            this.storage.credibleNonFungibleTokenList.setValue({
                ...nonFungibleTokenListFromStorage,
                [chainId]: nonFungibleTokenList,
            })

            const credibleToken = nonFungibleTokenList.find((x) => isSameAddress(x.address, address))
            return credibleToken ?? token
        }

        const credibleToken = nonFungibleTokenListByChainFromStorage.find((x) => isSameAddress(x.address, address))
        return credibleToken ?? token
    }
}
