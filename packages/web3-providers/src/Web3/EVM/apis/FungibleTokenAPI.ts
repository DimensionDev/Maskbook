import { uniq } from 'lodash-es'
import {
    CurrencyType,
    type FungibleAsset,
    type FungibleToken,
    multipliedBy,
    toFixed,
    formatBalance,
} from '@masknet/web3-shared-base'
import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base'
import { type ChainId, getEthereumConstant, type SchemaType } from '@masknet/web3-shared-evm'
import { EVMContractReadonly } from './ContractReadonlyAPI.js'
import * as CoinGeckoPriceEVM from /* webpackDefer: true */ '../../../CoinGecko/index.js'
import type { EVMHubOptions } from '../types/index.js'
import type { FungibleTokenAPI as FungibleTokenBaseAPI } from '../../../entry-types.js'

export class FungibleTokenAPI implements FungibleTokenBaseAPI.Provider<ChainId, SchemaType> {
    private createContract(chainId: ChainId) {
        const address = getEthereumConstant(chainId, 'BALANCE_CHECKER_ADDRESS')
        if (!address) throw new Error('Failed to create balance checker contract.')

        const contract = EVMContractReadonly.getBalanceCheckerContract(address, {
            chainId,
        })
        if (!contract) throw new Error('Failed to create balance checker contract.')

        return contract
    }

    async createAssets(fungibleToken: FungibleToken<ChainId, SchemaType>, chainId: ChainId, balance: number) {
        const price = await CoinGeckoPriceEVM.CoinGeckoPriceEVM.getFungibleTokenPrice(chainId, fungibleToken.address)

        return {
            ...fungibleToken,
            balance: balance.toFixed(),
            price: {
                [CurrencyType.USD]: toFixed(price),
            },
            value: {
                [CurrencyType.USD]: multipliedBy(price ?? 0, formatBalance(balance, fungibleToken.decimals)).toFixed(),
            },
        }
    }

    async getTrustedAssets(
        address: string,
        trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
        options?: EVMHubOptions,
    ) {
        if (!trustedFungibleTokens) return createPageable(EMPTY_LIST, createIndicator(options?.indicator))

        const chains = uniq(trustedFungibleTokens.map((x) => x.chainId))
        let result: Array<FungibleAsset<ChainId, SchemaType>> = EMPTY_LIST

        for (const chainId of chains) {
            const contract = this.createContract(chainId)
            if (!contract) return createPageable(EMPTY_LIST, createIndicator(options?.indicator))

            const balances = await contract.methods
                .balances(
                    [address],
                    trustedFungibleTokens.map((x) => x.address),
                )
                .call()

            const requests = balances
                .map((x, i) => {
                    if (!trustedFungibleTokens[i]) return
                    return this.createAssets(trustedFungibleTokens[i], chainId, Number.parseInt(x, 10))
                })
                .filter(Boolean)

            const assets = (await Promise.allSettled(requests))
                .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
                .filter(Boolean) as Array<FungibleAsset<ChainId, SchemaType>>

            result = [...result, ...assets]
        }

        return createPageable(result, createIndicator(options?.indicator))
    }
}
