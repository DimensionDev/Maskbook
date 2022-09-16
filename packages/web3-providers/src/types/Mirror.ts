import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface Writer {
    // domain name (the second level)
    domain?: string
    // ens name
    ens?: string
    avatarURL: string
    description?: string
    displayName?: string
    // EVM address
    address: string
}

export interface Entry {
    // arweave transaction ID
    transactionId: string
    digest: string
    // mm-dd-yyyy
    // version: string
    author: Writer
    // NFT token
    token?: NonFungibleToken<ChainId, SchemaType>
    content: {
        title: string
        // markdown
        body: string
        // unix timestamp
        timestamp: number
    }
}

export namespace MirrorBaseAPI {
    export interface Provider {
        getWriter(id: string): Promise<Writer | null>
        getPost(digest: string): Promise<Entry | null>
        // getCollectedPosts(): Promise<Pageable<Entry> | null>
        // getOwnedPosts(): Promise<Pageable<Entry> | null>
    }
}
