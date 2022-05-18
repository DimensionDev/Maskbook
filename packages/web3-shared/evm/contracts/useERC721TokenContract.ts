import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { useContract } from '../hooks/useContract'
import type { ChainId } from '../types'

export function useERC721TokenContract(address?: string, chainId?: ChainId) {
    return useContract<ERC721>(address, ERC721ABI as AbiItem[], chainId)
}
