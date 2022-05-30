import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContracts } from './useContract'

export function useERC721TokenContracts(chainId: ChainId, listOfAddress: string[] = []) {
    return useContracts<ERC721>(chainId, listOfAddress, ERC721ABI as AbiItem[])
}
