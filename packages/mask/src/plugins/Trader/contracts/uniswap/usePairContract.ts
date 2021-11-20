import type { AbiItem } from 'web3-utils'
import type { Pair } from '@masknet/web3-contracts/types/Pair'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import { ChainId, useContract, useContracts } from '@masknet/web3-shared-evm'

export function usePairContract(address: string, chainId?: ChainId) {
    return useContract<Pair>(address, PairABI as AbiItem[], false, chainId)
}

export function usePairContracts(listOfAddress: string[], chainId?: ChainId) {
    return useContracts<Pair>(listOfAddress, PairABI as AbiItem[], false, chainId)
}
