import type { AbiItem } from 'web3-utils'
import type { Qualification } from '@masknet/contracts/types/Qualification'
import QualificationABI from '@masknet/contracts/abis/Qualification.json'
import { useContract } from '@masknet/web3-shared'

export function useQualificationContract(address: string) {
    return useContract<Qualification>(address, QualificationABI as AbiItem[])
}
