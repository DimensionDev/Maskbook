import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { useContract } from '../hooks/useContract'
import { useChainId } from '../hooks'

export function useERC721TokenContract(address?: string) {
    const chainId = useChainId()
    return useContract<ERC721>(chainId, address, ERC721ABI as AbiItem[])
}
