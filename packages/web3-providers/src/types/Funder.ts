import type { Proof } from '@masknet/shared-base'

export namespace FunderAPI {
    export interface Payload {
        twitterHandle: string
        nonce: number
        publicKey: string
        // timestamp will expire after 1 hour
        ts: number
    }

    export interface Fund {
        message: {
            walletAddress: string
            tx: string
            code?: string
        }
    }

    export interface WhiteList {
        totalCount: number
        twitterHandler: string
        usedCount: number
    }

    export interface Operation {
        tokenTransferTx: string
        twitterHandler: string
        // eg: 1669970510248
        createAt: number
        nonce: number
        id: string
        walletAddress: string
    }

    export enum ScanKey {
        TwitterHandler = 'twitterHandler',
        OwnerAddress = 'ownerAddress',
        TokenTransferTx = 'tokenTransferTx',
        Id = 'id',
        WalletAddress = 'walletAddress',
    }

    export interface Provider<ChainId> {
        getRemainFrequency(handler: string): Promise<number>
        getOperationsByOwner(chainId: ChainId, owner: string): Promise<Operation[]>
        /** Fund token for a NextID public-derived EOA account. */
        fund(chainId: ChainId, proof: Proof): Promise<Fund>
        /** Verify whether if a whitelisted user account */
        verify(handler: string): Promise<boolean>
    }
}
