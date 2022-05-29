import type { AbiItem } from 'web3-utils'
import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract } from './useContract'

export function useERC1155TokenContract(chainId: ChainId, address: string) {
    return useContract(chainId, address, ERC1155 as AbiItem[])
}
