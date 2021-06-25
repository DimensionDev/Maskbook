import WETH_ABI from '@masknet/contracts/abis/WETH.json'
import type { WETH } from '@masknet/contracts/types/WETH'
import type { AbiItem } from 'web3-utils'
import { useTokenConstants } from '../constants'
import { useContract } from '../hooks/useContract'

export function useNativeTokenWrapperContract() {
    const { WETH_ADDRESS } = useTokenConstants()
    return useContract<WETH>(WETH_ADDRESS, WETH_ABI as AbiItem[])
}
