import { useTokensConstants } from '@masknet/constants'
import WETH_ABI from '@masknet/contracts/abis/WETH.json'
import type { WETH } from '@masknet/contracts/types/WETH'
import type { AbiItem } from 'web3-utils'
import { useContract } from '../hooks/useContract'

export function useNativeTokenWrapperContract() {
    const { WETH_ADDRESS } = useTokensConstants()
    return useContract<WETH>(WETH_ADDRESS, WETH_ABI as AbiItem[])
}
