import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { AbiItem } from 'web3-utils'
import { useContract } from '../hooks/useContract'

export function useERC721TokenContract(address?: string) {
    return useContract<ERC721>(address, ERC721ABI as AbiItem[])
}
