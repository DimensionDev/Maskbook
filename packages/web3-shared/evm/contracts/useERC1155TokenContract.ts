import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'
import type { AbiItem } from 'web3-utils'
import { useChainId, useContract } from '../hooks'

export function useERC1155TokenContract(address: string) {
    const chainId = useChainId()
    return useContract(chainId, address, ERC1155 as AbiItem[])
}
