import type { AbiItem } from 'web3-utils'
import RealityCardsMarketABI from '@masknet/web3-contracts/abis/RealityCardsMarket.json'
import type { RealityCardsMarket } from '@masknet/web3-contracts/types/RealityCardsMarket'
import { useContract } from '@masknet/web3-shared-evm'

export function useMarketContract(address: string) {
    return useContract<RealityCardsMarket>(address, RealityCardsMarketABI as AbiItem[])
}
