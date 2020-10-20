import type { AbiItem } from 'web3-utils'
import ERC20ABI from '../../contracts/splitter/ERC20.json'
import type { Erc20 } from '../../contracts/splitter/ERC20'
import { useContract } from '../hooks/useContract'

export function useERC20TokenContract(address: string) {
    return useContract<Erc20>(address, ERC20ABI as AbiItem[])
}
