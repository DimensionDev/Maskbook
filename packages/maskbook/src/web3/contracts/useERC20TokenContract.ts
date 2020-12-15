import type { AbiItem } from 'web3-utils'
import type { Erc20 as ERC20 } from '../../contracts/ERC20'
import ERC20ABI from '../../../abis/ERC20.json'
import { useContract } from '../hooks/useContract'

export function useERC20TokenContract(address: string) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[])
}
