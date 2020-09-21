import type { AbiItem } from 'web3-utils'
import PairABI from '../../../contracts/pair/Pair.json'
import type { Pair } from '../../../contracts/pair/Pair'
import { useContract } from '../../../web3/hooks/useContract'

export function usePairContract(address: string) {
    return useContract<Pair>(address, PairABI as AbiItem[])
}
