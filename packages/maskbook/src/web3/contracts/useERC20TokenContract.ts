import type { AbiItem } from 'web3-utils'
import type { ERC20 } from '@dimensiondev/contracts/types/ERC20'
import ERC20ABI from '@dimensiondev/contracts/abis/ERC20.json'
import { useContract } from '../hooks/useContract'

export function useERC20TokenContract(address: string) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[])
}
