import type { JsonRpcPayload } from 'web3-core-helpers'
import type { LegacyWalletRecord } from '../../../../shared/definitions/wallet'
export type { LegacyWalletRecord } from '../../../../shared/definitions/wallet'
export interface UnconfirmedRequestChunkRecord {
    /** A chunk of unconfirmed rpc requests */
    requests: JsonRpcPayload[]
    createdAt: Date
    updatedAt: Date
}

export interface LegacyWalletRecordInDatabase extends LegacyWalletRecord {}

export interface UnconfirmedRequestChunkRecordInDatabase extends UnconfirmedRequestChunkRecord {
    record_id: string
}
