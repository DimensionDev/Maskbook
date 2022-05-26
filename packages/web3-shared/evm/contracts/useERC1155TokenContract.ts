import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'
import type { AbiItem } from 'web3-utils'
import { useContract } from '../hooks'
import type { ChainId } from '../types'

export function useERC1155TokenContract(address: string, chainId?: ChainId) {
    return useContract(address, ERC1155 as AbiItem[], chainId)
}
