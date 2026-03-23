import type { TransactionSerializable } from 'viem'
export interface Account<ChainId> {
    account: string
    chainId: ChainId
    publicKey?: string
    privateKey?: string
}

export enum SignType {
    Message = 'message',
    TypedData = 'typedData',
    Transaction = 'transaction',
}

export type SignMessage = SignMessage_String | SignMessage_Transaction

export interface SignMessage_String {
    type: SignType.Message | SignType.TypedData
    data: string
}

export interface SignMessage_Transaction {
    type: SignType.Transaction
    data: TransactionSerializable
}
