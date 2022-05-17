import type { AbiItem } from 'web3-utils'
import type { Pair } from '@masknet/web3-contracts/types/Pair'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import { ChainId, useChainId, useContract, useContracts } from '@masknet/web3-shared-evm'

export function usePairContract(address: string, chainId?: ChainId) {
    const _chainId = useChainId()
    return useContract<Pair>(chainId ?? _chainId, address, PairABI as AbiItem[])
}

export function usePairContracts(listOfAddress: string[], chainId?: ChainId) {
    const _chainId = useChainId()
    return useContracts<Pair>(chainId ?? _chainId, listOfAddress, PairABI as AbiItem[])
}
