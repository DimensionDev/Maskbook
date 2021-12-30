import type { AbiItem } from 'web3-utils'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import QualificationABI from '@masknet/web3-contracts/abis/Qualification.json'
import Qualification2ABI from '@masknet/web3-contracts/abis/Qualification2.json'
import { useContract, isSameAddress, useITOConstants } from '@masknet/web3-shared-evm'

export function useQualificationContract(address?: string, ito_address?: string) {
    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const QLF_CONTRACT = useContract<Qualification>(address, QualificationABI as AbiItem[])
    const QLF2_CONTRACT = useContract<Qualification2>(address, Qualification2ABI as AbiItem[])

    return isSameAddress(ito_address, ITO_CONTRACT_ADDRESS)
        ? {
              version: 1,
              contract: QLF_CONTRACT,
          }
        : {
              version: 2,
              contract: QLF2_CONTRACT,
          }
}
