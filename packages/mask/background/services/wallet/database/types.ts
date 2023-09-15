import type { EIP2255Permission } from '@masknet/sdk'
import type { LegacyWalletRecord } from '@masknet/shared-base'
import type { JsonRpcPayload } from 'web3-core-helpers'

export interface RequestPayload extends JsonRpcPayload {
    owner?: string
    identifier?: string
    paymentToken?: string
    allowMaskAsGas?: boolean
}
export interface UnconfirmedRequestChunkRecord {
    /** A chunk of unconfirmed rpc requests */
    requests: RequestPayload[]
    createdAt: Date
    updatedAt: Date
}

export interface LegacyWalletRecordInDatabase extends LegacyWalletRecord {}

export interface UnconfirmedRequestChunkRecordInDatabase extends UnconfirmedRequestChunkRecord {
    record_id: string
}

export interface WalletGrantedPermission {
    type: 'granted_permission'
    id: string
    origins: ReadonlyMap<string, Set<EIP2255Permission>>
}
