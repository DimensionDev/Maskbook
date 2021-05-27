import type { AbiItem } from 'web3-utils'
import WETH_ABI from '@dimensiondev/contracts/abis/WETH.json'
import { useContract } from '../hooks/useContract'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import type { WETH } from '@dimensiondev/contracts/types/WETH'

export function useNativeTokenWrapperContract() {
    const address = useConstant(CONSTANTS, 'WETH_ADDRESS')
    return useContract<WETH>(address, WETH_ABI as AbiItem[])
}
