import type { ERC721TokenDetailed } from '../../web3/types'

export interface CollectibleJSON_Payload {
    address: string
    token_id: string
}

export interface CollectibleToken {
    contractAddress: string
    tokenId: string
}
