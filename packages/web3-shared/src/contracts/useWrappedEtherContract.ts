import WETH_ABI from '@masknet/contracts/abis/WETH.json'
import type { WETH } from '@masknet/contracts/types/WETH'
import type { AbiItem } from 'web3-utils'
import { TOKEN_CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useContract } from '../hooks/useContract'

export function useNativeTokenWrapperContract() {
    const { WETH_ADDRESS } = useConstant(TOKEN_CONSTANTS)
    return useContract<WETH>(WETH_ADDRESS, WETH_ABI as AbiItem[])
}
