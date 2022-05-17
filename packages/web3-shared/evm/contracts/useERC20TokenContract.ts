import type { AbiItem } from 'web3-utils'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import { useContract, useContracts } from '../hooks/useContract'
import type { ChainId } from '../types'
import { useChainId } from '../hooks'

export function useERC20TokenContract(address?: string, chainId?: ChainId) {
    const _chainId = useChainId()
    return useContract<ERC20>(chainId ?? _chainId, address, ERC20ABI as AbiItem[])
}

export function useERC20TokenContracts(listOfAddress: string[], chainId?: ChainId) {
    const _chainId = useChainId()
    return useContracts<ERC20>(chainId ?? _chainId, listOfAddress, ERC20ABI as AbiItem[])
}
