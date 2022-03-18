import type { AbiItem } from 'web3-utils'
import { useContract } from '@masknet/web3-shared-evm'
import type { MaskBoxQualification } from '@masknet/web3-contracts/types/MaskBoxQualification'
import MASK_BOX_QUALIFICATION_CONTRACT from '@masknet/web3-contracts/abis/MaskBoxQualification.json'

export function useMaskBoxQualificationContract(address?: string) {
    return useContract<MaskBoxQualification>(address, MASK_BOX_QUALIFICATION_CONTRACT as AbiItem[])
}
