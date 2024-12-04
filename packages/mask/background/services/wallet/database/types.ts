import type { JsonRpcPayload } from 'web3-core-helpers'
import type { EIP2255Permission } from '@masknet/sdk'
import type { LegacyWalletRecord } from '@masknet/shared-base'

export interface RequestPayload extends JsonRpcPayload {
    owner?: string
    identifier?: string
    paymentToken?: string
    allowMaskAsGas?: boolean
}
interface UnconfirmedRequestChunkRecord {
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
    origins: ReadonlyMap<string, ReadonlySet<EIP2255Permission>>
    /** unix timestamp */
    createdAt: number
}

export interface InternalWalletConnectRecord {
    type: 'internal_connected'
    id: string
    origins: ReadonlySet<string>
}
