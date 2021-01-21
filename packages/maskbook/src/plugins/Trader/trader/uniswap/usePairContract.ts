import type { AbiItem } from 'web3-utils'
import type { Pair } from '../../../../contracts/Pair'
import PairABI from '../../../../../abis/Pair.json'
import { useContract, useContracts } from '../../../../web3/hooks/useContract'

export function usePairContract(address: string) {
    return useContract<Pair>(address, PairABI as AbiItem[])
}

export function usePairContracts(listOfAddress: string[]) {
    return useContracts<Pair>(listOfAddress, PairABI as AbiItem[])
}
