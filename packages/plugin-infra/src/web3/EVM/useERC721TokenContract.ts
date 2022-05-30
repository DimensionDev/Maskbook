import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract } from './useContract'

export function useERC721TokenContract(chainId?: ChainId, address?: string) {
    return useContract<ERC721>(chainId, address, ERC721ABI as AbiItem[])
}
