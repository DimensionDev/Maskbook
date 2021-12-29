import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { AbiItem } from 'web3-utils'
import { useContracts } from '../hooks/useContract'

export function useERC721TokenContracts(listOfAddress: string[]) {
    return useContracts<ERC721>(listOfAddress, ERC721ABI as AbiItem[])
}
