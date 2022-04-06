import { createContract, useWeb3 } from '../hooks'
import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'
import type { AbiItem } from 'web3-utils'

export function useERC1155TokenContract(address: string) {
    const web3 = useWeb3()
    return createContract(web3, address, ERC1155 as AbiItem[])
}
