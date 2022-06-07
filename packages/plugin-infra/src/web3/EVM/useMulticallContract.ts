import type { AbiItem } from 'web3-utils'
import MulticallABI from '@masknet/web3-contracts/abis/Multicall.json'
import type { Multicall } from '@masknet/web3-contracts/types/Multicall'
import { ChainId, useEthereumConstants } from '@masknet/web3-shared-evm'
import { useContract } from './useContract'

export function useMulticallContract(chainId?: ChainId) {
    const { MULTICALL_ADDRESS } = useEthereumConstants(chainId)
    return useContract<Multicall>(chainId, MULTICALL_ADDRESS, MulticallABI as AbiItem[])
}
