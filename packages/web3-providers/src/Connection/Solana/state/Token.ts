import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress, type FungibleToken, type NonFungibleToken } from '@masknet/web3-shared-base'
import {
    type ChainId,
    formatAddress,
    isValidAddress,
    type SchemaType,
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { TokenState, type TokenStorage } from '../../Base/state/Token.js'
import { SolanaWeb3StateRef } from '../apis/Web3StateAPI.js'

export class Token extends TokenState<ChainId, SchemaType> {
    constructor(
        protected override context: Plugin.Shared.SharedUIContext,
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

    async createFungibleToken(
        chainId: ChainId,
        address: string,
        token?: FungibleToken<ChainId, SchemaType>,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId) || !address) return

        const fungibleTokenListFromStorage = this.storage.credibleFungibleTokenList.value
        const fungibleTokenListByChainFromStorage = fungibleTokenListFromStorage?.[chainId]

        if (!fungibleTokenListByChainFromStorage) {
            const hub = SolanaWeb3StateRef.value.Hub?.getHub?.({
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

    async createNonFungibleToken(
        chainId: ChainId,
        address: string,
        token?: NonFungibleToken<ChainId, SchemaType>,
    ): Promise<NonFungibleToken<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId) || !address) return

        const nonFungibleTokenListFromStorage = this.storage.credibleNonFungibleTokenList.value
        const nonFungibleTokenListByChainFromStorage = nonFungibleTokenListFromStorage?.[chainId]

        if (!nonFungibleTokenListByChainFromStorage) {
            const hub = SolanaWeb3StateRef.value.Hub?.getHub?.({
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
