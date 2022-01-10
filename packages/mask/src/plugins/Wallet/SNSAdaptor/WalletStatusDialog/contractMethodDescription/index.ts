import { getRedpacketDescription } from './getRedpacketDescription'
import type { ContractMethodInfo, ComputedPayload } from '../type'

export function getContractMethodDescription(contractMethodInfo: ContractMethodInfo, computedPayload: ComputedPayload) {
    return getRedpacketDescription(contractMethodInfo, computedPayload)
}
