import type { ProtocolPairsResolver, SavingsProtocol } from '../../types'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { createContract, ChainId, EthereumTokenType, getAaveConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { flatten, compact } from 'lodash-unified'
import { AAVEProtocol } from './AAVEProtocol'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider'
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import { getFungibleTokensDetailed, splitToPair } from '../common/tokens'

export class AAVEResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Mainnet]
    static getAaveLendingPoolAddressProviderContract(chainId: ChainId, web3: Web3) {
        const aaveLPoolAddress =
            getAaveConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS
        const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            aaveLPoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )
        return lPoolAddressProviderContract
    }

    static getProtocolDataContract(chainId: ChainId, web3: Web3) {
        const address = getAaveConstants(chainId).AAVE_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS
        return createContract<AaveProtocolDataProvider>(web3, address, AaveProtocolDataProviderABI as AbiItem[])
    }

    private async lookupPoolAddress(chainId: ChainId, web3: Web3) {
        const lPoolAddressProviderContract = AAVEResolver.getAaveLendingPoolAddressProviderContract(chainId, web3)
        if (lPoolAddressProviderContract === null) return null
        return lPoolAddressProviderContract.methods.getLendingPool().call()
    }

    private async lookupTokens(chainId: ChainId, web3: Web3) {
        const protocolDataContract = AAVEResolver.getProtocolDataContract(chainId, web3)
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

    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Mainnet)) {
            return []
        }
        const [allTokens, poolAddress] = await Promise.all([
            this.lookupTokens(chainId, web3),
            this.lookupPoolAddress(chainId, web3),
        ])
        if (poolAddress === null) return []
        const detailedAaveTokens = await getFungibleTokensDetailed(allTokens, web3, chainId)
        return splitToPair(detailedAaveTokens).map((pair: any) => new AAVEProtocol(pair, poolAddress))
    }
}

export const aaveLazyResolver = new AAVEResolver()
