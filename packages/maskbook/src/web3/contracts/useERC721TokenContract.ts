import type { AbiItem } from 'web3-utils'
import type { ERC721 } from '@dimensiondev/contracts/types/ERC721'
import ERC721ABI from '@dimensiondev/contracts/abis/ERC721.json'
import { useContract } from '../hooks/useContract'

export function useERC721TokenContract(address: string) {
    return useContract<ERC721>(address, ERC721ABI as AbiItem[])
}
