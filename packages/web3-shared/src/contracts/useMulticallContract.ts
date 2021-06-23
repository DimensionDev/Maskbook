import type { AbiItem } from 'web3-utils'
import MulticallABI from '@masknet/contracts/abis/Multicall.json'
import { useContract } from '../hooks/useContract'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import type { Multicall } from '@masknet/contracts/types/Multicall'

export function useMulticallContract() {
    const { MULTICALL_ADDRESS } = useConstant(CONSTANTS)
    return useContract<Multicall>(MULTICALL_ADDRESS, MulticallABI as AbiItem[])
}
