import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { createContract, ChainId, EthereumTokenType } from '@masknet/web3-shared-evm'
import type { Comptroller } from '@masknet/web3-contracts/types/Comptroller'
import ComptrollerABI from '@masknet/web3-contracts/abis/Comptroller.json'
import { getFungibleTokensDetailed, splitToPair } from './tokens'
import type { CERC20 } from '@masknet/web3-contracts/types/CERC20'
import CERC20ABI from '@masknet/web3-contracts/abis/CERC20.json'
import { flatten, compact } from 'lodash-unified'

export default class CompoundLikeFetcher {
    static getComptrollerContract(address: string, web3: Web3) {
        return createContract<Comptroller>(web3, address, ComptrollerABI as AbiItem[])
    }

    static async lookupMeta(marketAddress: string, web3: Web3) {
        const contract = createContract<CERC20>(web3, marketAddress, CERC20ABI as AbiItem[])
        const underlying = await contract?.methods.underlying().call()
        return [underlying, marketAddress]
    }

    static async lookupTokens(compAddress: string, web3: Web3) {
        const comptroller = CompoundLikeFetcher.getComptrollerContract(compAddress, web3)
        if (comptroller === null) return []
        const allMarkets = await comptroller.methods.getAllMarkets().call()
        const allMarketsPairs = await Promise.all(allMarkets.map((market: string) => this.lookupMeta(market, web3)))
        console.log(allMarketsPairs)
        const allTokens =
            compact(flatten(allMarketsPairs)).map((m) => {
                return { address: m, type: EthereumTokenType.ERC20 }
            }) ?? []
        return allTokens
    }

    static async fetch(compAddress: string, chainId: ChainId, web3: Web3) {
        const allTokens = await this.lookupTokens(compAddress, web3)
        const detailedTokens = await getFungibleTokensDetailed(allTokens, web3, chainId)
        return splitToPair(detailedTokens)
    }
}
