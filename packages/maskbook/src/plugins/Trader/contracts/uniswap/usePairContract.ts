import type { AbiItem } from 'web3-utils'
import PairABI from '../../../../contracts/pair/Pair.json'
import type { Pair } from '../../../../contracts/pair/Pair'
import { useContract, useContracts } from '../../../../web3/hooks/useContract'

export function usePairContract(address: string) {
    return useContract<Pair>(address, PairABI as AbiItem[])
}

export function usePairContracts(listOfAddress: string[]) {
    return useContracts<Pair>(listOfAddress, PairABI as AbiItem[])
}
