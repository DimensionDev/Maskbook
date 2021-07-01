import ERC721ABI from '@masknet/contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/contracts/types/ERC721'
import type { AbiItem } from 'web3-utils'
import { useContract } from '../hooks/useContract'

export function useERC721TokenContract(address: string) {
    return useContract<ERC721>(address, ERC721ABI as AbiItem[])
}
