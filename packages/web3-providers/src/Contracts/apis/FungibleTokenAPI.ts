import {
    createIndicator,
    createPageable,
    CurrencyType,
    type FungibleAsset,
    type FungibleToken,
    type HubOptions,
    multipliedBy,
    toFixed,
    formatBalance,
} from '@masknet/web3-shared-base'
import type { AbiItem } from 'web3-utils'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker.js'
import { ChainId, createContract, getEthereumConstant, type SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleTokenAPI } from '../../entry-types.js'
import { Web3API } from '../../EVM/index.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CoinGeckoPriceEVM } from '../../entry.js'
import { uniq } from 'lodash-es'

export class ContractFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    private web3 = new Web3API()

    private createWeb3(chainId: ChainId) {
        return this.web3.getWeb3(chainId)
    }

    private createContract(chainId: ChainId) {
        const address = getEthereumConstant(chainId, 'BALANCE_CHECKER_ADDRESS')
        if (!address) throw new Error('Failed to create multicall contract.')

        const web3 = this.createWeb3(chainId)
        const contract = createContract<BalanceChecker>(web3, address, BalanceCheckerABI as unknown as AbiItem[])
        if (!contract) throw new Error('Failed to create multicall contract.')

        return contract
    }

    async createAssets(fungibleToken: FungibleToken<ChainId, SchemaType>, chainId: ChainId, balance: number) {
        const price = await CoinGeckoPriceEVM.getFungibleTokenPrice(chainId, fungibleToken.address)

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
        options?: HubOptions<ChainId>,
    ) {
        if (!trustedFungibleTokens) createPageable(EMPTY_LIST, createIndicator(options?.indicator))

        const chains = uniq(trustedFungibleTokens?.map((x) => x.chainId)) ?? [ChainId.Mainnet]
        let result: Array<FungibleAsset<ChainId, SchemaType>> = EMPTY_LIST

        for (const chainId of chains) {
            const contract = this.createContract(chainId)
            if (!contract) return createPageable(EMPTY_LIST, createIndicator(options?.indicator))

            const balances = await contract.methods
                .balances([address], trustedFungibleTokens?.map((x) => x.address) ?? [])
                .call()

            const requests = balances
                .map((x, i) => {
                    if (!trustedFungibleTokens?.[i]) return
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
