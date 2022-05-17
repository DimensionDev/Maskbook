import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import type { AbiItem } from 'web3-utils'
import { useChainId } from '../hooks'
import { useContract, useContracts } from '../hooks/useContract'
import type { ChainId } from '../types'

export function useERC20TokenBytes32Contract(address?: string, chainId?: ChainId) {
    const _chainId = useChainId()
    return useContract<ERC20Bytes32>(chainId ?? _chainId, address, ERC20Bytes32ABI as AbiItem[])
}

export function useERC20TokenBytes32Contracts(listOfAddress: string[], chainId?: ChainId) {
    const _chainId = useChainId()
    return useContracts<ERC20Bytes32>(chainId ?? _chainId, listOfAddress, ERC20Bytes32ABI as AbiItem[])
}
