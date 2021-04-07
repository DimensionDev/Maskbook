import type { AbiItem } from 'web3-utils'
import MaskITO_ABI from '@dimensiondev/contracts/abis/MaskITO.json'
import type { MaskITO } from '@dimensiondev/contracts/types/MaskITO'
import { ITO_CONSTANTS } from '../constants'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'

export function useMaskITO_Contract() {
    const MASK_ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'MASK_ITO_CONTRACT_ADDRESS')
    return useContract<MaskITO>(MASK_ITO_CONTRACT_ADDRESS, MaskITO_ABI as AbiItem[])
}
