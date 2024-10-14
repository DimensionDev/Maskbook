import type { AbiItem } from 'web3-utils'
import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json' with { type: 'json' }
import type { WETH } from '@masknet/web3-contracts/types/WETH.js'
import { type ChainId, useTokenConstants } from '@masknet/web3-shared-evm'
import { useContract } from './useContract.js'

export function useNativeTokenWrapperContract(chainId?: ChainId) {
    const { WNATIVE_ADDRESS } = useTokenConstants(chainId)
    return useContract<WETH>(chainId, WNATIVE_ADDRESS, WETH_ABI as AbiItem[])
}
