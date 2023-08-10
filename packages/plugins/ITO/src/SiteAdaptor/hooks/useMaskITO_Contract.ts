import type { AbiItem } from 'web3-utils'
import MaskITO_ABI from '@masknet/web3-contracts/abis/MaskITO.json'
import type { MaskITO } from '@masknet/web3-contracts/types/MaskITO.js'
import { type ChainId, useITOConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/web3-hooks-evm'

export function useMaskITO_Contract(chainId?: ChainId) {
    const { MASK_ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    return useContract<MaskITO>(chainId, MASK_ITO_CONTRACT_ADDRESS, MaskITO_ABI as AbiItem[])
}
