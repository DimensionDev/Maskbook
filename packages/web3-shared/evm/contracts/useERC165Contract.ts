import type { AbiItem } from 'web3-utils'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165'
import { useContract } from '../hooks/useContract'

export function useERC165Contract(address?: string) {
    return useContract<ERC165>(address, ERC165ABI as AbiItem[])
}
