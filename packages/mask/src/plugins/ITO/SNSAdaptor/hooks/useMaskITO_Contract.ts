import MaskITO_ABI from '@masknet/web3-contracts/abis/MaskITO.json'
import type { MaskITO } from '@masknet/web3-contracts/types/MaskITO'
import { useContract, useITOConstants } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function useMaskITO_Contract() {
    const { MASK_ITO_CONTRACT_ADDRESS } = useITOConstants()
    return useContract<MaskITO>(MASK_ITO_CONTRACT_ADDRESS, MaskITO_ABI as AbiItem[])
}
