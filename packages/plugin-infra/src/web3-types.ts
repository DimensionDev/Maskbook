import type { BigNumber } from 'bignumber.js'
import type { Subscription } from 'use-subscription'
import type { Pagination, Plugin, Pageable } from './types'

/**
 * A network plugin defines the way to connect to a single chain.
 */
export enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
}

export enum CurrencyType {
    NATIVE = 'native',
    BTC = 'btc',
    USD = 'usd',
}

export enum TokenType {
    Fungible = 'Fungible',
    NonFungible = 'NonFungible',
}

type ColorRGB = `rgb(${number}, ${number}, ${number})`
type ColorRGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type ColorHEX = `#${number}${number}${number}${number}${number}${number}` | `#${number}${number}${number}`
type ColorHSL = `hsl(${number}, ${number}%, ${number}%)`
type Color = ColorRGB | ColorRGBA | ColorHEX | ColorHSL

export declare namespace Web3Plugin {
    /**
     * Plugin can declare what chain it supports to trigger side effects (e.g. create a new transaction).
     * When the current chain is not supported, the composition entry will be hidden.
     */
    export type EnableRequirement = Partial<
        Record<
            NetworkPluginID,
            {
                supportedChainIds?: number[]
            }
        >
    >

    export interface NetworkDescriptor {
        /** An unique ID for each network */
        ID: string
        /** The ID of a plugin that provides the functionality of this network. */
        networkSupporterPluginID: string
        /** The chain id */
        chainId: number
        /** The network type */
        type: string
        /** The network icon */
        icon: URL
        /** The network icon in fixed color */
        iconColor: Color
        /** The network name */
        name: string
        /** Is a mainnet network */
        isMainnet: boolean
    }
    export interface ProviderDescriptor {
        /** An unique ID for each wallet provider */
        ID: string
        /** The ID of a plugin that provides the adoption of this provider. */
        providerAdaptorPluginID: string
        /** The provider type */
        type: string
        /** The provider icon */
        icon: URL
        /** The provider name */
        name: string
    }

    export interface ApplicationCategoryDescriptor {
        /** An unique ID for each category */
        ID: string
        /** The category icon */
        icon: URL
        /** The category name */
        name: string
    }

    export interface CryptoPrice {
        [token: string]: {
            [key in CurrencyType]?: number
        }
    }
    export interface ChainDetailed {
        name: string
        chainId: number
        fullName?: string
        shortName?: string
        chainName?: string
        network?: string // mainnet
    }
    export interface Wallet {
        /** User define wallet name. Default address.prefix(6) */
        name: string
        /** The address of wallet */
        address: string
        /** true: Mask Wallet, false: External Wallet */
        hasStoredKeyInfo: boolean
        /** true: Derivable Wallet. false: UnDerivable Wallet */
        hasDerivationPath: boolean
    }
    export interface Asset<T extends Token = Token> {
        id: string
        chainId: number
        balance: string
        /** estimated price */
        price?: {
            [key in CurrencyType]?: string
        }
        /** estimated value */
        value?: {
            [key in CurrencyType]?: string
        }
        logoURI?: string
        token: T
    }

    export interface AddressName {
        id: string
        /** eg. vitalik.eth */
        label: string
        /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
        ownerAddress: string
        /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
        resolvedAddress?: string
    }

    export interface Transaction {
        id: string
        type: string
        title: string
        from: string
        to: string
        timestamp: string
        /** 0: failed 1: succeed */
        status: 0 | 1
        /** estimated tx fee */
        fee: {
            [key in CurrencyType]?: string
        }
    }

    export interface Token {
        id: string
        chainId: number
    }

    export interface FungibleToken extends Token {
        id: string
        type: TokenType.Fungible
        address: string
        decimals?: number
        name: string
        symbol: string
        logoURI?: string | string[]
    }

    export interface NonFungibleContract {
        chainId: number
        name: string
        symbol: string
        address: string
        iconURL?: string
    }

    export interface FungibleTokenMetadata {
        name: string
        symbol: string
        decimals: number
        iconURL?: string
        token: FungibleToken
    }

    export interface NonFungibleTokenMetadata {
        name: string
        description: string
        mediaType: string
        iconURL?: string
        assetURL?: string
    }

    export interface NonFungibleToken extends Token {
        // chainId_contractAddress_tokenId
        id: string
        tokenId: string
        type: TokenType.NonFungible
        name: string
        description?: string
        owner?: string
        metadata?: NonFungibleTokenMetadata
        contract?: NonFungibleContract
    }

    export interface TokenList {
        name: string
        description?: string
        tokens: Token[]
    }

    export type domainAddressBook = {
        [chainId: number]: Record<string, string> | undefined
    }

    export namespace ObjectCapabilities {
        export interface SharedState {
            allowTestnet?: Subscription<boolean>
            /** The ID of currently chosen sub-network. */
            chainId?: Subscription<number>
            /** The address of the currently chosen wallet. */
            account?: Subscription<string>
            /** The balance of the currently chosen account. */
            balance?: Subscription<string>
            /** The currently tracked block height. */
            blockNumber?: Subscription<number>
            /** The network type. */
            networkType?: Subscription<string | undefined>
            /** The wallet provider type. */
            providerType?: Subscription<string | undefined>
            /** The asset data provider. */
            assetType?: Subscription<string | undefined>
            /** The address name data provider. */
            nameType?: Subscription<string | undefined>
            /** The collectible data provider. */
            collectibleType?: Subscription<string | undefined>
            /** The transaction data provider. */
            transactionType?: Subscription<string | undefined>
            /** The currency of estimated values and prices. */
            currencyType?: Subscription<CurrencyType>
            /** The tracked token prices which stored as address and price pairs. */
            prices?: Subscription<CryptoPrice>
            /** The currently stored wallet by MaskWallet. */
            wallets?: Subscription<Wallet[]>
            /** The default derivable wallet. */
            walletPrimary?: Subscription<Wallet | null>
            /** The user added fungible tokens. */
            fungibleTokens?: Subscription<FungibleToken[]>
            /** The user added non-fungible tokens. */
            nonFungibleTokens?: Subscription<NonFungibleToken[]>
        }
        export interface AssetState {
            /** Get fungible assets of given account. */
            getFungibleAssets?: (
                address: string,
                providerType: string,
                network: NetworkDescriptor,
                pagination?: Pagination,
            ) => Promise<Asset<FungibleToken>[]>
            /** Get non-fungible assets of given account. */
            getNonFungibleAssets?: (
                address: string,
                pagination: Pagination,
                providerType?: string,
                network?: NetworkDescriptor,
            ) => Promise<Pageable<NonFungibleToken>>
        }
        export interface NameServiceState {
            lookup?: (domain: string) => Promise<string | undefined>
            reverse?: (address: string) => Promise<string | undefined>
        }
        export interface TokenManage {
            addToken: (token: Token) => Promise<void>
            removeToken: (token: Token) => Promise<void>
            trustToken: (token: Token) => Promise<void>
            blockToken: (token: Token) => Promise<void>
        }
        export interface TransactionState {
            /** Get latest transactions of given account. */
            getTransactions: (
                address: string,
                providerType: string,
                network: NetworkDescriptor,
                pagination?: Pagination,
            ) => Promise<Transaction[]>
        }
        export interface TokenListState {
            /** Get the token lists of supported fungible tokens. */
            getFungibleTokenLists: (
                address: string,
                providerType: string,
                network: NetworkDescriptor,
                pagination?: Pagination,
            ) => Promise<TokenList[]>
            /** Get the token lists of supported non-fungible tokens. */
            getNonFungibleTokenLists: (
                address: string,
                providerType: string,
                network: NetworkDescriptor,
                pagination?: Pagination,
            ) => Promise<TokenList[]>
        }
        export interface Others {
            isChainIdValid?: (chainId: number, allowTestnet: boolean) => boolean
            getChainDetailed?: (chainId: number) => ChainDetailed | undefined
            getFungibleTokenMetadata?: (token: FungibleToken) => Promise<FungibleTokenMetadata>
            getNonFungibleTokenMetadata?: (token: NonFungibleToken) => Promise<NonFungibleTokenMetadata>

            formatAddress?: (address: string, size?: number) => string
            formatCurrency?: (value: BigNumber.Value, sign?: string, symbol?: string) => string
            formatBalance?: (value: BigNumber.Value, decimals?: number, significant?: number) => string

            resolveChainName?: (chainId: number) => string
            resolveChainFullName?: (chainId: number) => string
            resolveChainColor?: (chainId: number) => string

            resolveTransactionLink?: (chainId: number, transactionId: string) => string
            resolveAddressLink?: (chainId: number, address: string) => string
            resolveNonFungibleTokenLink?: (chainId: number, address: string, tokenId: string) => string
            resolveBlockLink?: (chainId: number, blockNumber: string) => string

            resolveDomainLink?: (domain: string) => string
            isValidDomain?: (domain: string) => boolean
            formatDomainName?: (domain?: string, size?: number) => string | undefined
        }
        export interface Capabilities {
            Shared?: SharedState
            Asset?: AssetState
            NameService?: NameServiceState
            Token?: TokenManage
            Transaction?: TransactionState
            TokenList?: TokenListState
            Utils?: Others
        }
    }
    export namespace UI {
        export interface NetworkIconClickBaitProps {
            network: NetworkDescriptor
            provider?: ProviderDescriptor
            children?: React.ReactNode
            onClick?: (network: NetworkDescriptor, provider?: ProviderDescriptor) => void
            onSubmit?: (network: NetworkDescriptor, provider?: ProviderDescriptor) => void
        }
        export interface ProviderIconClickBaitProps {
            network: NetworkDescriptor
            provider: ProviderDescriptor
            children?: React.ReactNode
            onClick?: (network: NetworkDescriptor, provider: ProviderDescriptor) => void
            onSubmit?: (network: NetworkDescriptor, provider: ProviderDescriptor) => void
        }
        export interface ApplicationCategoryIconClickBaitProps {
            category: ApplicationCategoryDescriptor
        }
        export interface AddressFormatterProps {
            address: string
            size?: number
        }
        export interface UI {
            SelectNetworkMenu?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<UI.NetworkIconClickBaitProps>
            }
            SelectProviderDialog?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<UI.NetworkIconClickBaitProps>
                /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
                ProviderIconClickBait?: Plugin.InjectUIReact<UI.ProviderIconClickBaitProps>
            }
            WalletStatusDialog?: {
                /** This UI will receive application category icon as children component, and the plugin may hook click handle on it. */
                ApplicationCategoryIconClickBait?: Plugin.InjectUIReact<UI.ApplicationCategoryIconClickBaitProps>
            }
        }
    }
}
