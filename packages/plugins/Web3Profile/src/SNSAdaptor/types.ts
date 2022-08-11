import type { BindingProof, NextIDPlatform, ProfileInformation } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export interface GeneralAsset {
    platform: string
    identity: string
    id: string // contractAddress-id or admin_address
    type: string
    info: {
        collection?: string
        collection_icon?: string
        image_preview_url?: string | null
        animation_url?: string | null
        animation_original_url?: string | null
        title?: string
        total_contribs?: number
        token_contribs?: Array<{
            token: string
            amount: string
        }>
        start_date?: string
        end_date?: string
        country?: string
        city?: string
    }
}

export interface PersonaKV {
    persona: string
    proofs?: Proof[]
}
export interface Patch {
    hiddenAddresses: WalletsCollection
    unListedCollections: Record<
        string,
        {
            NFTs: string[]
            Donations: string[]
            Footprints: string[]
        }
    >
}
export interface Proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, Patch>
}
export interface CollectionTypes {
    platform: NetworkPluginID
    address: string // take id as address if collection is a poap
    key: string // address + tokenId as unique key of NFT, id as unique key of poap
    tokenId?: string
    iconURL?: string
    hidden?: boolean
    name?: string
    chainId?: ChainId
}

export interface Collection {
    address: string
    collections?: CollectionTypes[]
}
export enum AssetType {
    GitcoinDonation = 'Gitcoin-Donation',
    POAP = 'POAP',
}
export interface Response {
    status: boolean
    assets: GeneralAsset[]
}

export interface WalletsCollection {
    NFTs?: WalletTypes[]
    donations?: WalletTypes[]
    footprints?: WalletTypes[]
}

export interface WalletTypes {
    address: string
    platform?: NetworkPluginID
    updateTime?: string
    collections?: CollectionTypes[]
}

export interface AccountType extends BindingProof {
    walletList: WalletsCollection
    linkedProfile?: ProfileInformation
}

export interface AlchemyResponse_EVM {
    ownedNfts: AlchemyNFT_EVM[]
    pageKey?: string
}

export interface AlchemyNFT_EVM {
    contract: {
        address: string
    }
    id: {
        tokenId: string
        tokenMetadata: {
            tokenType: 'ERC721' | 'ERC1155'
        }
    }
    title: string
    description: string
    tokenUri: {
        raw: string
        gateway: string
    }
    media: [
        {
            raw: string
            gateway: string
        },
    ]
    metadata: {
        name: string
        description: string
        image: string
        image_url: string
        external_url: string
        animation_url: string
        attributes: Array<{
            value: string
            trait_type: string
        }>
    }
    timeLastUpdated: string
}
