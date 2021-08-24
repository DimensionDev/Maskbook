import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import type { AbiItem } from 'web3-utils'
import { useContract, useContracts } from '../hooks/useContract'

export function useERC20TokenBytes32Contract(address?: string) {
    return useContract<ERC20Bytes32>(address, ERC20Bytes32ABI as AbiItem[])
}

export function useERC20TokenBytes32Contracts(listOfAddress: string[], readonly = false) {
    return useContracts<ERC20Bytes32>(listOfAddress, ERC20Bytes32ABI as AbiItem[], readonly)
}
