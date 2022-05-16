import type { AbiItem } from 'web3-utils'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { MaskBoxQualification } from '@masknet/web3-contracts/types/MaskBoxQualification'
import MASK_BOX_QUALIFICATION_CONTRACT from '@masknet/web3-contracts/abis/MaskBoxQualification.json'
import { useContract } from '@masknet/plugin-infra/src/entry-web3-evm'

export function useMaskBoxQualificationContract(chainId: ChainId, address?: string) {
    return useContract<MaskBoxQualification>(chainId, address, MASK_BOX_QUALIFICATION_CONTRACT as AbiItem[])
}
