import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { AbiItem } from 'web3-utils'
import { useChainId } from '../hooks'
import { useContracts } from '../hooks/useContract'

export function useERC721TokenContracts(listOfAddress: string[]) {
    const chainId = useChainId()
    return useContracts<ERC721>(chainId, listOfAddress, ERC721ABI as AbiItem[])
}
