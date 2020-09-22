import type { AbiItem } from 'web3-utils'
import MulticallABI from '../../contracts/multicall/Multicall.json'
import type { Multicall } from '../../contracts/multicall/Multicall'
import { useContract } from '../hooks/useContract'

export function useMulticallContract(address: string) {
    return useContract<Multicall>(address, MulticallABI as AbiItem[]) as Multicall
}
