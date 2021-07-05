import ERC20Bytes32ABI from '@masknet/contracts/abis/ERC20Bytes32.json'
import type { ERC20Bytes32 } from '@masknet/contracts/types/ERC20Bytes32'
import type { AbiItem } from 'web3-utils'
import { useContract } from '../hooks/useContract'

export function useERC20TokenBytes32Contract(address: string) {
    return useContract<ERC20Bytes32>(address, ERC20Bytes32ABI as AbiItem[])
}
