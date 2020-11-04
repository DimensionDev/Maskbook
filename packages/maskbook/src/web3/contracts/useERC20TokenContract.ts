import type { AbiItem } from 'web3-utils'
import ERC20ABI from '../../contracts/erc20/ERC20.json'
import type { Erc20 as ERC20 } from '../../contracts/erc20/ERC20'
import { useContract } from '../hooks/useContract'

export function useERC20TokenContract(address: string) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[])
}
