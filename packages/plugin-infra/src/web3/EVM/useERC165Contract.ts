import type { AbiItem } from 'web3-utils'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract } from './useContract'

export function useERC165Contract(chainId?: ChainId, address?: string) {
    return useContract<ERC165>(chainId, address, ERC165ABI as AbiItem[])
}
