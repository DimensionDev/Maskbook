import type { ChainId } from '@masknet/web3-shared-evm'

export namespace FunderAPI {
    export interface Payload {
        twitterHandler: string
        nonce: number
        // timestamp will expire after 1 hour
        ts: number
    }
    export interface Proof {
        publicKey: string
        payload: string // JSON.stringify(payload)
        signature: string
    }

    export interface Fund {
        walletAddress: string
        tx: string
    }

    export interface Provider {
        /** Get all supported chain ids. */
        getSupportedChainIds(): Promise<ChainId[]>
        /** Fund token for a NextID public-derived EOA account. */
        fund(chainId: ChainId, proof: Proof): Promise<Fund>
    }
}
