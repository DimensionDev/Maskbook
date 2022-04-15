import { getRedpacketDescription } from './getRedpacketDescription'
import { getITO_Description } from './getITO_Description'
import { getNFTRedpacketDescription } from './getNFTRedpacketDescription'
import type { ContractMethodInfo } from '../type'
import type { ComputedPayload } from '../../../../../extension/background-script/EthereumServices/rpc'

export function getContractMethodDescription(contractMethodInfo: ContractMethodInfo, computedPayload: ComputedPayload) {
    return (
        getRedpacketDescription(contractMethodInfo, computedPayload) ??
        getITO_Description(contractMethodInfo, computedPayload) ??
        getNFTRedpacketDescription(contractMethodInfo, computedPayload)
    )
}
