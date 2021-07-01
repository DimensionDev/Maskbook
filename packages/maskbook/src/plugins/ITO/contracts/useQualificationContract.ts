import type { AbiItem } from 'web3-utils'
import type { Qualification } from '@masknet/contracts/types/Qualification'
import type { Qualification2 } from '@masknet/contracts/types/Qualification2'
import QualificationABI from '@masknet/contracts/abis/Qualification.json'
import Qualification2ABI from '@masknet/contracts/abis/Qualification2.json'
import { useContract, isSameAddress, useITOConstants } from '@masknet/web3-shared'

export function useQualificationContract(address: string, ito_address: string) {
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
