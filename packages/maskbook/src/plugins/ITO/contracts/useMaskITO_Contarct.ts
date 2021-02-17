import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import MaskITO_ABI from '../../../../abis/MaskITO.json'
import type { MaskITO } from '../../../contracts/MaskITO'

export function useMaskITO_Contract() {
    const address = useConstant(ITO_CONSTANTS, 'MASK_ITO_CONTRACT_ADDRESS')
    return useContract<MaskITO>(address, MaskITO_ABI as AbiItem[])
}
