import type RSS3 from 'rss3-next'
import type { Transaction as Web3Transaction } from 'web3-core'
import type { CurrencyType, Pageable, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Result } from 'ts-results'
import type { NextIDAction, NextIDStoragePayload, NextIDPayload, NextIDPlatform } from '@masknet/shared-base'

export namespace ExplorerAPI {
    export type Transaction = Web3Transaction & {
        status: '0' | '1'
        confirmations: number
    }

    export interface PageInfo {
        offset?: number
        apikey?: string
    }

    export interface Provider {
        getLatestTransactions(account: string, url: string, pageInfo?: PageInfo): Promise<Transaction[]>
    }
}
export namespace RSS3BaseAPI {
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
            token_contribs?: {
                token: string
                amount: string
            }[]
            start_date?: string
            end_date?: string
            country?: string
            city?: string
        }
    }

    export interface GeneralAssetWithTags extends GeneralAsset {
        tags?: string[]
    }

    export interface GeneralAssetResponse {
        status: boolean
        assets: GeneralAsset[]
    }

    export interface ProfileInfo {
        avatar: string[]
        bio: string
        name: string
    }

    export enum AssetType {
        GitcoinDonation = 'Gitcoin-Donation',
        POAP = 'POAP',
        NFT = 'NFT',
    }

    export interface NameInfo {
        rnsName: string
        ensName: string | null
        address: string
    }

    export interface Provider {
        createRSS3(address: string): RSS3
        getFileData<T>(rss3: RSS3, address: string, key: string): Promise<T | undefined>
        setFileData<T>(rss3: RSS3, address: string, key: string, data: T): Promise<T>
        getDonations(address: string): Promise<GeneralAssetResponse | undefined>
        getFootprints(address: string): Promise<GeneralAssetResponse | undefined>
        getNameInfo(id: string): Promise<NameInfo | undefined>
        getProfileInfo(address: string): Promise<ProfileInfo | undefined>
    }
}

export namespace PriceAPI {
    export interface Provider {
        getTokenPrice(tokenId: string, currency: CurrencyType): Promise<Web3Plugin.CryptoPrices['']>
        getTokensPrice(tokenIds: string[], currency: CurrencyType): Promise<Web3Plugin.CryptoPrices>
    }
}

export namespace HistoryAPI {
    export interface Provider {
        getTransactions(chainId: number, address: string): Promise<Pageable<Web3Plugin.Transaction>>
    }
}

export namespace GasPriceAPI {
    export interface Provider {
        getGasPrice(chainId: number): Promise<Web3Plugin.GasPrice>
    }
}

export namespace FungibleTokenAPI {
    export interface Provider {
        getAssets(chainId: number, address: string): Promise<Pageable<Web3Plugin.FungibleAsset>>
    }
}

export namespace NonFungibleTokenAPI {
    export interface Options {
        chainId?: number
        page?: number
        size?: number
    }

    export interface Provider {
        getAsset?: (
            address: string,
            tokenId: string,
            opts?: Options,
        ) => Promise<Web3Plugin.NonFungibleAsset | undefined>
        getAssets?: (address: string) => Promise<Web3Plugin.NonFungibleAsset[]>
        getHistory?: (
            address: string,
            tokenId: string,
            opts?: Options,
        ) => Promise<Web3Plugin.NonFungibleAsset['events']>
        getListings?: (
            address: string,
            tokenId: string,
            opts?: Options,
        ) => Promise<Web3Plugin.NonFungibleAsset['orders']>
        getOffers?: (address: string, tokenId: string, opts?: Options) => Promise<Web3Plugin.NonFungibleAsset['orders']>
        getOrders?: (
            address: string,
            tokenId: string,
            side: string,
            opts?: Options,
        ) => Promise<Web3Plugin.NonFungibleAsset['orders']>
        getToken?: (
            address: string,
            tokenId: string,
            opts?: Options,
        ) => Promise<Web3Plugin.NonFungibleToken | undefined>
        getTokens?: (from: string, opts?: Options) => Promise<Pageable<Web3Plugin.NonFungibleToken>>
        getContract?: (address: string, opts?: Options) => Promise<Web3Plugin.NonFungibleToken['contract'] | undefined>
        getCollections?: (
            address: string,
            opts?: Options,
        ) => Promise<Pageable<Web3Plugin.NonFungibleToken['collection'] | undefined>>
    }
}

export namespace RiskWanringBaseAPI {
    export interface Provider {
        approve(address: string, pluginID?: string): Promise<void>
    }
}

export namespace StorageAPI {
    export interface Storage {
        set(key: string, value: any): Promise<void>
        get<T>(key: string): Promise<T | undefined>
        delete?(key: string): Promise<void>
    }

    export interface Provider {
        createJSON_Storage?(key: string): Storage
        createBinaryStorage?(key: string): Storage
    }
}

export namespace NextIDBaseAPI {
    export interface Storage {
        set<T>(
            uuid: string,
            personaPublicKey: string,
            signature: string,
            platform: NextIDPlatform,
            identity: string,
            createdAt: string,
            patchData: unknown,
        ): Promise<Result<T, string>>
        get<T>(key: string): Promise<Result<T, string>>
        getPayload(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            patchData: unknown,
        ): Promise<Result<NextIDStoragePayload, string>>
    }
    export interface Proof {
        bindProof(
            uuid: string,
            personaPublicKey: string,
            action: NextIDAction,
            platform: string,
            identity: string,
            createdAt: string,
            options?: {
                walletSignature?: string
                signature?: string
                proofLocation?: string
            },
        ): Promise<Result<unknown, string>>

        queryExistedBindingByPersona(personaPublicKey: string, enableCache?: boolean): Promise<any>

        queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number): Promise<any>

        queryIsBound(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            enableCache?: boolean,
        ): Promise<boolean>

        createPersonaPayload(
            personaPublicKey: string,
            action: NextIDAction,
            identity: string,
            platform: NextIDPlatform,
            language?: string,
        ): Promise<NextIDPayload | null>
    }
}

export namespace SecurityAPI {
    export interface Holder {
        address?: string
        locked?: '0' | '1'
        tag?: string
        is_contract?: '0' | '1'
        balance?: number
        percent?: number
    }

    export interface TradingSecurity {
        buy_tax?: string
        sell_tax?: string
        slippage_modifiable?: '0' | '1'
        is_honeypot?: '0' | '1'
        transfer_pausable?: '0' | '1'
        is_blacklisted?: '0' | '1'
        is_whitelisted?: '0' | '1'
        is_in_dex?: '0' | '1'
        is_anti_whale?: '0' | '1'
    }

    export interface ContractSecurity {
        is_open_source?: '0' | '1'
        is_proxy?: '0' | '1'
        is_mintable?: '0' | '1'
        owner_change_balance?: '0' | '1'
        can_take_back_ownership?: '0' | '1'
        owner_address?: string
        creator_address?: string
    }

    export interface TokenSecurity {
        token_name?: string
        token_symbol?: string

        holder_count?: number
        total_supply?: number
        holders?: Holder[]

        lp_holder_count?: number
        lp_total_supply?: number
        lp_holders?: Holder[]

        is_true_token?: '0' | '1'
        is_verifiable_team?: '0' | '1'
        is_airdrop_scam?: '0' | '1'
    }

    export interface SupportedChain {
        id: ChainId
        name: string
    }

    export interface Provider {
        getTokenSecurity(
            chainId: number,
            listOfAddress: string[],
        ): Promise<Record<string, ContractSecurity & TokenSecurity & TradingSecurity> | void>
        getSupportedChain(): Promise<SupportedChain[]>
    }
}

export namespace TwitterBaseAPI {
    export interface NFTContainer {
        has_nft_avatar: boolean
        nft_avatar_metadata: AvatarMetadata
    }

    export interface AvatarMetadata {
        token_id: string
        smart_contract: {
            __typename: 'ERC721' | 'ERC1155'
            __isSmartContract: 'ERC721'
            network: 'Ethereum'
            address: string
        }
        metadata: {
            creator_username: string
            creator_address: string
            name: string
            description?: string
            collection: {
                name: string
                metadata: {
                    image_url: string
                    verified: boolean
                    description: string
                    name: string
                }
            }
            traits: {
                trait_type: string
                value: string
            }[]
        }
    }
    export interface Provider {
        getUserNftContainer: (screenName: string) => Promise<
            | {
                  address: string
                  token_id: string
                  type_name: string
              }
            | undefined
        >
    }
}

export namespace InstagramBaseAPI {
    export interface Provider {
        uploadUserAvatar: (
            image: File | Blob,
            userId: string,
        ) => Promise<
            | {
                  changed_profile: boolean
                  profile_pic_url_hd: string
              }
            | undefined
        >
    }
}

export namespace TokenListBaseAPI {
    export interface Token {
        address: string
        chainId: number
        name: string
        symbol: string
        decimals: number
        logoURI?: string
    }

    export interface TokenList {
        keywords: string[]
        logoURI: string
        name: string
        timestamp: string
        tokens: Token[]
        version: {
            major: number
            minor: number
            patch: number
        }
    }

    export interface TokenObject {
        tokens: Record<string, Token>
    }

    export interface Provider {
        fetchFungibleTokensFromTokenLists: (chainId: number, urls: string[]) => Promise<Web3Plugin.FungibleToken[]>
    }
}

export namespace TokenPriceBaseAPI {
    export interface CryptoPrice {
        [token: string]: {
            [currency: string]: number
        }
    }

    export interface Provider {
        getTokenPrices: (platform: string, contractAddresses: string[], currency: CurrencyType) => Promise<CryptoPrice>
        getNativeTokenPrice: (tokenIds: string[], currency: CurrencyType) => Promise<CryptoPrice>
    }
}

export namespace MaskBaseAPI {
    export type Input = { id: number; data: api.IMWRequest }
    export type Output = { id: number; response: api.MWResponse }

    export type Request = InstanceType<typeof api.MWRequest>
    export type Response = InstanceType<typeof api.MWResponse>

    export type StoredKeyInfo = api.IStoredKeyInfo

    export interface Provider {}
}
