import MulticallABI from '@masknet/contracts/abis/Multicall.json'
import type { Multicall } from '@masknet/contracts/types/Multicall'
import type { AbiItem } from 'web3-utils'
import { useEthereumConstants } from '../constants'
import { useContract } from '../hooks/useContract'

export function useMulticallContract() {
    const { MULTICALL_ADDRESS } = useEthereumConstants()
    return useContract<Multicall>(MULTICALL_ADDRESS, MulticallABI as AbiItem[])
}
