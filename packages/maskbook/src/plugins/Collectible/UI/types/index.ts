export * from './opensea'

export interface CollectibleJSON_Payload {
    address: string
    token_id: string
}

export interface CollectibleToken {
    contractAddress: string
    tokenId: string
    // schemaName: WyvernSchemaName
}
