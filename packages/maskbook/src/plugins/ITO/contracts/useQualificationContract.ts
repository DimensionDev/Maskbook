import type { AbiItem } from 'web3-utils'
import type { Qualification } from '@dimensiondev/contracts/types/Qualification'
import QualificationABI from '@dimensiondev/contracts/abis/Qualification.json'
import { useContract } from '../../../web3/hooks/useContract'

export function useQualificationContract(address: string) {
    return useContract<Qualification>(address, QualificationABI as AbiItem[])
}
