import type { AbiItem } from 'web3-utils'
import { EMPTY_LIST } from '@masknet/shared-base'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json' with { type: 'json' }
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract, useContracts } from './useContract.js'

export function useERC20TokenContract(chainId?: ChainId, address?: string) {
    return useContract<ERC20>(chainId, address, ERC20ABI as AbiItem[])
}

export function useERC20TokenContracts(chainId?: ChainId, listOfAddress: string[] = EMPTY_LIST) {
    return useContracts<ERC20>(chainId, listOfAddress, ERC20ABI as AbiItem[])
}
