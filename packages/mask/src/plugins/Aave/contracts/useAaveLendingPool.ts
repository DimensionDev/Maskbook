import type { AbiItem } from 'web3-utils'
import LendingPoolABI from '../abis/LendingPool.json'
import { ChainId, useContract } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types'
import type { ContractOptions } from 'web3-eth-contract'

export interface AaveLendingPool extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): AaveLendingPool
}

export function useAaveLendingPoolContract(address?: string,  chainId: ChainId=ChainId.Mainnet) {
    return useContract<AaveLendingPool>(address, LendingPoolABI.abi as unknown as AbiItem[], undefined, chainId)
}
