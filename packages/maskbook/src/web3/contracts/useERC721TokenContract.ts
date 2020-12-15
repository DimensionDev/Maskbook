import type { AbiItem } from 'web3-utils'
import type { Erc721 as ERC721 } from '../../contracts/ERC721'
import ERC721ABI from '../../../abis/ERC721.json'
import { useContract } from '../hooks/useContract'

export function useERC721TokenContract(address: string) {
    return useContract<ERC721>(address, ERC721ABI as AbiItem[])
}
