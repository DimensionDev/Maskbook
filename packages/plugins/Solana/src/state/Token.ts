import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenState, TokenStorage } from '@masknet/web3-state'
import { isSameAddress, FungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, formatAddress, isValidAddress, SchemaType, isValidChainId } from '@masknet/web3-shared-solana'
import { Web3StateSettings } from '../settings/index.js'

export class Token extends TokenState<ChainId, SchemaType> {
    constructor(
        protected override context: Plugin.Shared.SharedContext,
        protected override subscriptions: {
            account?: Subscription<string>
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
            formatAddress,
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
            const hub = await Web3StateSettings.value.Hub?.getHub?.({
                chainId,
            })
            const fungibleTokenList = await hub?.getFungibleTokensFromTokenList?.(chainId)
            this.storage.credibleFungibleTokenList.setValue({
                ...fungibleTokenListFromStorage,
                [chainId]: fungibleTokenList,
            })

            const credibleToken = fungibleTokenList?.find((x) => isSameAddress(x.address, address))
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
            const hub = await Web3StateSettings.value.Hub?.getHub?.({
                chainId,
            })
            const nonFungibleTokenList = await hub?.getNonFungibleTokensFromTokenList?.(chainId)
            this.storage.credibleNonFungibleTokenList.setValue({
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
