import { ChainId as ChainId_EVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainId_Solana } from '@masknet/web3-shared-solana'

export const NetworkName: Record<number, string> = {
    [ChainId_EVM.Mainnet]: 'ethereum-mainnet',
    [ChainId_EVM.Arbitrum]: 'arbitrum-mainnet',
    [ChainId_EVM.BSC]: 'bsc-mainnet',
    [ChainId_EVM.Optimism]: 'optimism-mainnet',
    [ChainId_EVM.Matic]: 'polygon-mainnet',
    [ChainId_EVM.Fantom]: 'fantom-mainnet',
    [ChainId_EVM.Harmony]: 'harmony-mainnet',
    [ChainId_Solana.Mainnet]: 'solana-mainnet',
}

export enum Features_Key {
    'Angle modification speed' = 'Angle modification speed',
    'Glow' = 'Glow',
    'Line thickness' = 'Line thickness',
    'Main drawing area size' = 'Main drawing area size',
    'Maximum shape size' = 'Maximum shape size',
    'Rarity tier' = 'Rarity tier',
    'Shape scaling speed' = 'Shape scaling speed',
    'Square blue amount' = 'Square blue amount',
    'Square green amount' = 'Square green amount',
    'Square red amount' = 'Square red amount',
    'Triangle blue amount' = 'Triangle blue amount',
    'Triangle green amount' = 'Triangle green amount',
    'Triangle red amount' = 'Triangle red amount',
}

export interface RoyaltyInfo {
    additionalPayee: string
    additionalPayeePercentage: string
    artistAddress: string
    royaltyFeeByID: string
}

export interface Trait {
    trait_type: string
    value: string
}

export interface AssetMeta {
    animation_url: string
    artist: string
    aspect_ratio: number
    collection_name: string
    curation_status: string
    description: string
    external_url: string
    features: Record<Features_Key, string>
    generator_url: string
    heritage_curation_status: string
    image: string
    is_static: boolean
    license: string
    minted: boolean
    name: string
    payout_address: string
    platform: string
    project_id: string
    royaltyInfo: RoyaltyInfo
    script_type: string
    series: string
    tokenID: string
    token_hash: string
    traits: Trait[]
    website: string
}

export interface Asset {
    address: string
    token_id: string
    tokenId: string
    collection_name: string
    collectionName: string
    url: string
    name: string
    metadata: AssetMeta
    small_preview_image_url: string
    smallPreviewImageUrl: string
    mediumPreviewImageUrl: string
}

export interface Collection {
    address: string
    name: string
    small_preview_image_url: string
    smallPreviewImageUrl: string
    symbol: string
    url: string
    creator: string
    owner: string
    numAssets: number
    isSpam: boolean
    spamReasons: string | null
}

export interface OwnedNfts {
    contract: {
        address: string
    }
    id: {
        tokenId: string
    }
}
export interface Assets {
    totalCount: string
    pageKey: string
    ownedNfts: OwnedNfts[]
}
