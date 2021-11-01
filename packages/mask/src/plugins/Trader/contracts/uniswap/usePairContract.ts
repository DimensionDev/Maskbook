import type { AbiItem } from 'web3-utils'
import type { Pair } from '@masknet/web3-contracts/types/Pair'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import { useContract, useContracts } from '@masknet/web3-shared-evm'

export function usePairContract(address: string) {
    return useContract<Pair>(address, PairABI as AbiItem[])
}

export function usePairContracts(listOfAddress: string[]) {
    return useContracts<Pair>(listOfAddress, PairABI as AbiItem[])
}
