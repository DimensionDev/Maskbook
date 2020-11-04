import type { AbiItem } from 'web3-utils'
import ERC721Abi from '../../contracts/erc721/ERC721.json'
import type { Erc721 as ERC721 } from '../../contracts/erc721/ERC721'
import { useContract } from '../hooks/useContract'

export function useERC721TokenContract(address: string) {
    return useContract<ERC721>(address, ERC721Abi as AbiItem[])
}
