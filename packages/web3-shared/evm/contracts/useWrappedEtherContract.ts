import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json'
import type { WETH } from '@masknet/web3-contracts/types/WETH'
import type { AbiItem } from 'web3-utils'
import { useTokenConstants } from '../constants'
import { useContract } from '../hooks/useContract'

export function useNativeTokenWrapperContract() {
    const { WNATIVE_ADDRESS } = useTokenConstants()
    return useContract<WETH>(WNATIVE_ADDRESS, WETH_ABI as AbiItem[])
}
