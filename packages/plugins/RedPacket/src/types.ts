import type { NetworkType } from "@masknet/web3-shared-evm";

export enum NFTSelectOption {
    All = 'All',
    Partial = 'Partial',
}

export enum RequirementType {
    Follow = 'Follow',
    Like = 'Like',
    Repost = 'Repost',
    Comment = 'Comment',
    NFTHolder = 'NFTHolder'
}


export type FireflyRedpacketSettings = {
    requirements: RequirementType[]
    nftHolderContract?: string
    nftCollectionName?: string
}


export type FireflySocialProfile = {
    profileId: string;
    displayName: string;
    handle: string;
    fullHandle: string;
    pfp: string;
    address?: string;
    ownedBy?: string
}


export interface FireflyContext {
    currentLensProfile?: FireflySocialProfile | null
    currentFarcasterProfile?: FireflySocialProfile | null
}

export enum FireflyAccountSource {
    Lens = 'Lens',
    Farcaster = 'Farcaster',
    Wallet = 'Wallet'
}
