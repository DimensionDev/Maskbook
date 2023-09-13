import type { AbiItem } from 'web3-utils'
import type { Pair } from '@masknet/web3-contracts/types/Pair.js'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract, useContracts } from '@masknet/web3-hooks-evm'

export function usePairContract(chainId?: ChainId, address?: string) {
    return useContract<Pair>(chainId, address, PairABI as AbiItem[])
}

export function usePairContracts(chainId?: ChainId, listOfAddress: string[] = EMPTY_LIST) {
    return useContracts<Pair>(chainId, listOfAddress, PairABI as AbiItem[])
}
