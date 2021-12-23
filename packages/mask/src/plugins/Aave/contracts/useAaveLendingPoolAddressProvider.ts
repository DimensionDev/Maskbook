import type { AbiItem } from 'web3-utils'
import LendingPoolAddressProvider from '../abis/LendingPoolAddressProvider.json'
import { ChainId, useContract } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types'
import type { ContractOptions } from 'web3-eth-contract'

export interface AaveLendingPoolAddressProvider extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): AaveLendingPoolAddressProvider
}

export function useAaveLendingPoolAddressProviderContract(address: string, chainId: ChainId = ChainId.Mainnet) {
    return useContract<AaveLendingPoolAddressProvider>(
        address,
        LendingPoolAddressProvider.abi as unknown as AbiItem[],
        undefined,
        chainId,
    )
}
