import type { NonFungibleCollection } from '@masknet/web3-shared-base'
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
    version: string
    author: Writer
    collaborators?: Writer[]
    // NFT token
    collection: NonFungibleCollection<ChainId, SchemaType.ERC721>
    content: {
        title: string
        // markdown
        body: string
        // unix timestamp
        timestamp: number
    }
}

export interface Publisher {
    author: Writer
    coAuthors: Writer[]
}

export interface MirrorInitData {
    props?: {
        pageProps?: {
            projectAddress: string
        }
    }
}
