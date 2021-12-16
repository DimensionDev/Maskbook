import type { AbiItem } from 'web3-utils'
import ProtocolDataProviderABI from '../abis/ProtocolDataProvider.json'
import { ChainId, useContract } from '@masknet/web3-shared-evm'
import type { BaseContract } from '@masknet/web3-contracts/types/types'
import type { ContractOptions } from 'web3-eth-contract'

export interface AaveProtocolDataProvider extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): AaveProtocolDataProvider
}

export function useAaveProtocolDataProviderContract(address?: string, chainId: ChainId=ChainId.Mainnet) {
    return useContract<AaveProtocolDataProvider>(
        address,
        ProtocolDataProviderABI.abi as unknown as AbiItem[],
        undefined,
        chainId
    )
}
