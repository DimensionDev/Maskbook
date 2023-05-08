export interface Account<ChainId> {
    account: string
    chainId: ChainId
}

export enum SignType {
    Message = 'message',
    TypedData = 'typedData',
    Transaction = 'transaction',
}
