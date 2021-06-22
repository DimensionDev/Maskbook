import type { AbiItem } from 'web3-utils'
import type { Pair } from '@masknet/contracts/types/Pair'
import PairABI from '@masknet/contracts/abis/Pair.json'
import { useContract, useContracts } from '@masknet/web3-shared'

export function usePairContract(address: string) {
    return useContract<Pair>(address, PairABI as AbiItem[])
}

export function usePairContracts(listOfAddress: string[]) {
    return useContracts<Pair>(listOfAddress, PairABI as AbiItem[])
}
