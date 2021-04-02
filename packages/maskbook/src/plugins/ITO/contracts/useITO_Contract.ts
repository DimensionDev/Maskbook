import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import ITO_ABI from '@dimensiondev/contracts/abis/ITO.json'
import MaskITO_ABI from '@dimensiondev/contracts/abis/MaskITO.json'
import type { ITO } from '@dimensiondev/contracts/types/ITO'
import type { MaskITO } from '@dimensiondev/contracts/types/MaskITO'

export function useITO_Contract(isMask: boolean) {
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const MASK_ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'MASK_ITO_CONTRACT_ADDRESS')
    const ITO_Contract = useContract<ITO>(ITO_CONTRACT_ADDRESS, ITO_ABI as AbiItem[])
    const MaskITO_Contract = useContract<MaskITO>(MASK_ITO_CONTRACT_ADDRESS, MaskITO_ABI as AbiItem[])
    return isMask ? MaskITO_Contract : ITO_Contract
}
