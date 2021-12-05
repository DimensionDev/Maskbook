import type { ChainId } from '@masknet/web3-shared-evm'

export interface CryptoartAI_Payload {
    chain_id: ChainId
    creator: string
    token_id: string
    contractAddress: string
}

export enum CryptoartAITab {
    ARTICLE = 0,
    TOKEN = 1,
    OFFER = 2,
    HISTORY = 3,
}

export interface CryptoartAIToken {
    chainId: ChainId
    creator: string
    tokenId: string
    contractAddress: string
}
