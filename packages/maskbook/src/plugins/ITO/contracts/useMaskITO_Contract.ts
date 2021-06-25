import MaskITO_ABI from '@masknet/contracts/abis/MaskITO.json'
import type { MaskITO } from '@masknet/contracts/types/MaskITO'
import { useContract, useITOConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useMaskITO_Contract() {
    const { MASK_ITO_CONTRACT_ADDRESS } = useITOConstants()
    return useContract<MaskITO>(MASK_ITO_CONTRACT_ADDRESS, MaskITO_ABI as AbiItem[])
}
