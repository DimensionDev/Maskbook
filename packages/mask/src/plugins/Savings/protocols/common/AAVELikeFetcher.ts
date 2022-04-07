import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { createContract, ChainId, EthereumTokenType, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { flatten, compact } from 'lodash-unified'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider'
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import { getFungibleTokensDetailed, splitToPair } from './tokens'

export default class AAVELikeFetcher {
    static getAaveLendingPoolAddressProviderContract(aaveLPoolAddress: string, chainId: ChainId, web3: Web3) {
        const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            aaveLPoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )
        return lPoolAddressProviderContract
    }

    static getProtocolDataContract(dataAddress: string, chainId: ChainId, web3: Web3) {
        return createContract<AaveProtocolDataProvider>(web3, dataAddress, AaveProtocolDataProviderABI as AbiItem[])
    }

    static async lookupPoolAddress(aaveLPoolAddress: string, chainId: ChainId, web3: Web3) {
        const lPoolAddressProviderContract = this.getAaveLendingPoolAddressProviderContract(
            aaveLPoolAddress,
            chainId,
            web3,
        )
        if (lPoolAddressProviderContract === null) return null
        return lPoolAddressProviderContract.methods.getLendingPool().call()
    }

    static async lookupTokens(dataProviderAddress: string, chainId: ChainId, web3: Web3) {
        const protocolDataContract = this.getProtocolDataContract(dataProviderAddress, chainId, web3)
        const tokens = await protocolDataContract?.methods.getAllReservesTokens().call()
        const aTokens = await protocolDataContract?.methods.getAllATokens().call()
        const aaveTokens = tokens?.map((token) => {
            return [token[1], aTokens?.filter((f) => f[0].toUpperCase() === `a${token[0]}`.toUpperCase())[0][1]]
        })
        const allTokens =
            compact(flatten(aaveTokens ?? [])).map((m) => {
                return { address: m, type: EthereumTokenType.ERC20 }
            }) ?? []
        return allTokens
    }

    static async fetch(dataProviderAddress: string, poolProviderAddress: string, chainId: ChainId, web3: Web3) {
        const [allTokens, poolAddress] = await Promise.all([
            this.lookupTokens(dataProviderAddress, chainId, web3),
            this.lookupPoolAddress(poolProviderAddress, chainId, web3),
        ])
        if (poolAddress === null) return []
        const detailedAaveTokens = await getFungibleTokensDetailed(allTokens, web3, chainId)
        const allPairs = splitToPair(detailedAaveTokens)
        return allPairs.map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
            return [pair, poolAddress, dataProviderAddress]
        })
    }
}
