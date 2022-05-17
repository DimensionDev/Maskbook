import type { AbiItem } from 'web3-utils'
import { useChainId, useContract } from '@masknet/web3-shared-evm'
import type { MaskBoxQualification } from '@masknet/web3-contracts/types/MaskBoxQualification'
import MASK_BOX_QUALIFICATION_CONTRACT from '@masknet/web3-contracts/abis/MaskBoxQualification.json'

export function useMaskBoxQualificationContract(address?: string) {
    const chainId = useChainId()
    return useContract<MaskBoxQualification>(chainId, address, MASK_BOX_QUALIFICATION_CONTRACT as AbiItem[])
}
