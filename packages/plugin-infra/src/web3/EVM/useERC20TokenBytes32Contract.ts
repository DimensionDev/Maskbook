import type { AbiItem } from 'web3-utils'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract, useContracts } from './useContract'

export function useERC20TokenBytes32Contract(chainId?: ChainId, address?: string) {
    return useContract<ERC20Bytes32>(chainId, address, ERC20Bytes32ABI as AbiItem[])
}

export function useERC20TokenBytes32Contracts(chainId?: ChainId, listOfAddress: string[] = []) {
    return useContracts<ERC20Bytes32>(chainId, listOfAddress, ERC20Bytes32ABI as AbiItem[])
}
