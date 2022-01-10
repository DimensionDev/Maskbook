import { getRedpacketDescription } from './getRedpacketDescription'
import { getITO_Description } from './getITO_Description'
import type { ContractMethodInfo, ComputedPayload } from '../type'

export function getContractMethodDescription(contractMethodInfo: ContractMethodInfo, computedPayload: ComputedPayload) {
    return (
        getRedpacketDescription(contractMethodInfo, computedPayload) ??
        getITO_Description(contractMethodInfo, computedPayload)
    )
}
