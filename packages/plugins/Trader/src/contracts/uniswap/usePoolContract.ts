import type { AbiItem } from 'web3-utils'
import { useContracts } from '@masknet/web3-hooks-evm'
import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'

export function usePoolContracts(chainId?: ChainId, listOfAddress: string[] = EMPTY_LIST) {
    return useContracts<PoolStateV3>(chainId, listOfAddress, PoolStateV3ABI as AbiItem[])
}
