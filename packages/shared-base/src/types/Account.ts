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
