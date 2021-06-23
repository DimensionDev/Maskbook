import type { AbiItem } from 'web3-utils'
import WETH_ABI from '@masknet/contracts/abis/WETH.json'
import { useContract } from '../hooks/useContract'
import { TOKEN_CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import type { WETH } from '@masknet/contracts/types/WETH'

export function useNativeTokenWrapperContract() {
    const { WETH_ADDRESS } = useConstant(TOKEN_CONSTANTS)
    return useContract<WETH>(WETH_ADDRESS, WETH_ABI as AbiItem[])
}
