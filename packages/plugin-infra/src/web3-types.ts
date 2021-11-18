import type { Subscription } from 'use-subscription'
import type { BigNumber } from 'bignumber.js'
import type { Pagination } from './types'
import type { Plugin } from '.'

export declare namespace Web3Plugin {
    export interface EnableRequirement {
        /**
         * Plugin can declare what chain it supports to trigger side effects (e.g. create a new transaction).
         * When the current chain is not supported, the composition entry will be hidden.
         */
        supportedOperationalChains?: number[]
    }
    export interface NetworkDescriptor {
        /** An unique ID for each network */
        ID: string
        /** The ID of a plugin that provides the functionality of this network. */
        networkSupporterPluginID: string
        /** The network type */
        type: string
        /** The network icon */
        icon: URL
        /** The network name */
        name: string
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

    export interface CryptoPrice {
        [token: string]: {
            [key in CurrencyType]: number
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
    export interface Asset<T extends unknown> {
        id: string
        chain: string
        balance: string
        token: Token<T>
        /** estimated price */
        price?: {
            [key in CurrencyType]: string
        }
        /** estimated value */
        value?: {
            [key in CurrencyType]: string
        }
        logoURI?: string
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
            [key in CurrencyType]: string
        }
    }

    export interface Token<T extends unknown> {
        id: string
        type: TokenType
        token: T
    }

    export interface FungibleTokenMetadata<T extends unknown> {
        name: string
        symbol: string
        decimals: number
        iconURL?: string
        _token: T
    }

    export interface NonFungibleTokenMetadata<T extends unknown> {
        name: string
        description: string
        mediaType: string
        iconURL?: string
        assetURL?: string
        _token: T
    }

    export interface TokenList<T extends unknown> {
        name: string
        description?: string
        tokens: Token<T>[]
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
            fungibleTokens?: Subscription<Token<unknown>[]>
            /** The user added non-fungible tokens. */
            nonFungibleTokens?: Subscription<Token<unknown>[]>
        }
        export interface AssetState {
            /** Get fungible assets of given account. */
            getFungibleAssets?: <T extends unknown>(
                address: string,
                providerType: string,
                networkType: string,
                pagination?: Pagination,
            ) => Promise<Asset<T>[]>
            /** Get non-fungible assets of given account. */
            getNonFungibleAssets: <T extends unknown>(
                address: string,
                providerType: string,
                networkType: string,
                pagination?: Pagination,
            ) => Promise<Asset<T>[]>
        }
        export interface TokenManage {
            addToken: <T extends unknown>(token: Token<T>) => Promise<void>
            removeToken: <T extends unknown>(token: Token<T>) => Promise<void>
            trustToken: <T extends unknown>(token: Token<T>) => Promise<void>
            blockToken: <T extends unknown>(token: Token<T>) => Promise<void>
        }
        export interface TransactionState {
            /** Get latest transactions of given account. */
            getTransactions: (
                address: string,
                providerType: string,
                networkType: string,
                pagination?: Pagination,
            ) => Promise<Transaction[]>
        }
        export interface TokenListState {
            /** Get the token lists of supported fungible tokens. */
            getFungibleTokenLists: <T extends unknown>(
                address: string,
                providerType: string,
                networkType: string,
                pagination?: Pagination,
            ) => Promise<TokenList<T>[]>
            /** Get the token lists of supported non-fungible tokens. */
            getNonFungibleTokenLists: <T extends unknown>(
                address: string,
                providerType: string,
                networkType: string,
                pagination?: Pagination,
            ) => Promise<TokenList<T>[]>
        }
        export interface Others {
            isChainIdValid?: (chainId: number, allowTestnet: boolean) => boolean
            getChainDetailed?: (chainId: number) => ChainDetailed | undefined
            getFungibleTokenMetadata?: <T extends unknown>(token: Token<T>) => Promise<FungibleTokenMetadata<T>>
            getNonFungibleTokenMetadata?: <T extends unknown>(token: Token<T>) => Promise<NonFungibleTokenMetadata<T>>

            formatAddress?: (address: string, size?: number) => string
            formatCurrency?: (value: BigNumber.Value, sign?: string, symbol?: string) => string
            formatBalance?: (value: BigNumber.Value, decimals?: number, significant?: number) => string

            resolveChainName?: (chainId: number) => string
            resolveChainFullName?: (chainId: number) => string
            resolveChainColor?: (chainId: number) => string

            resolveTransactionLink?: (chainId: number, transactionId: string) => string
            resolveAddressLink?: (chainId: number, address: string) => string
            resolveBlockLink?: (chainId: number, blockNumber: string) => string
        }
        export interface Capabilities {
            Shared?: SharedState
            Asset?: AssetState
            Token?: TokenManage
            Transaction?: TransactionState
            TokenList?: TokenListState
            Utils?: Others
        }
    }
    export namespace UI {
        export interface NetworkIconClickBaitProps {
            network: NetworkDescriptor
            children?: React.ReactNode
            onClick?: () => void
        }
        export interface ProviderIconClickBaitProps {
            network: NetworkDescriptor
            provider: ProviderDescriptor
            children?: React.ReactNode
            onClick?: () => void
        }
        export interface AddressFormatterProps {
            address: string
            size?: number
        }
        export interface SelectProviderDialogBait {
            /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
            NetworkIconClickBait?: Plugin.InjectUIReact<UI.NetworkIconClickBaitProps>
            /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
            ProviderIconClickBait?: Plugin.InjectUIReact<UI.ProviderIconClickBaitProps>
        }
        export interface UI {
            SelectProviderDialog?: SelectProviderDialogBait
        }
    }
}

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
