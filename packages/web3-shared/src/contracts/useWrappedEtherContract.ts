import type { AbiItem } from 'web3-utils'
import WETH_ABI from '@masknet/contracts/abis/WETH.json'
import { useContract } from '../hooks/useContract'
import { TOKEN_CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import type { WETH } from '@masknet/contracts/types/WETH'

export function useNativeTokenWrapperContract() {
    const address = useConstant(TOKEN_CONSTANTS, 'WETH_ADDRESS')
    return useContract<WETH>(address, WETH_ABI as AbiItem[])
}
