import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import type { AbiItem } from 'web3-utils'
import { useContract, useContracts } from '../hooks/useContract'
import type { ChainId } from '../types'

export function useERC20TokenContract(address?: string, readonly = false, chainId?: ChainId) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[], readonly, chainId)
}

export function useERC20TokenContracts(listOfAddress: string[], readonly = false, chainId?: ChainId) {
    return useContracts<ERC20>(listOfAddress, ERC20ABI as AbiItem[], readonly, chainId)
}
