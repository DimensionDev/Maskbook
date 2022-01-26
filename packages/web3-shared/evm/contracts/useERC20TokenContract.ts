import type { AbiItem } from 'web3-utils'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import { useContract, useContracts } from '../hooks/useContract'
import type { ChainId } from '../types'

export function useERC20TokenContract(address?: string, chainId?: ChainId) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[], chainId)
}

export function useERC20TokenContracts(listOfAddress: string[], chainId?: ChainId) {
    return useContracts<ERC20>(listOfAddress, ERC20ABI as AbiItem[], chainId)
}
