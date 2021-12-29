import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json'
import type { WETH } from '@masknet/web3-contracts/types/WETH'
import type { AbiItem } from 'web3-utils'
import { useTokenConstants } from '../constants'
import { useContract } from '../hooks/useContract'
import type { ChainId } from '../types'

export function useNativeTokenWrapperContract(chainId?: ChainId) {
    const { WNATIVE_ADDRESS } = useTokenConstants(chainId)
    return useContract<WETH>(WNATIVE_ADDRESS, WETH_ABI as AbiItem[])
}
