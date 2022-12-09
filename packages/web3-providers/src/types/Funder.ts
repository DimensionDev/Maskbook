import type { ChainId } from '@masknet/web3-shared-evm'

export namespace FunderAPI {
    export interface Payload {
        twitterHandler: string
        nonce: number
        publicKey: string
        // timestamp will expire after 1 hour
        ts: number
    }
    export interface Proof {
        ownerAddress: string
        payload: string // JSON.stringify(payload)
        signature: string
    }

    export interface Fund {
        walletAddress: string
        tx: string
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

    export interface Provider {
        /** Get all supported chain ids. */
        getSupportedChainIds(): Promise<ChainId[]>
        /** Fund token for a NextID public-derived EOA account. */
        fund(chainId: ChainId, proof: Proof): Promise<Fund>
        verify(handler: string): Promise<boolean>
        queryRemainFrequency(handler: string): Promise<number>
        queryOperationByOwner(owner: string): Promise<Operation[]>
    }
}
