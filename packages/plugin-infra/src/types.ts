import type React from 'react'
import type { Option, Result } from 'ts-results'
import type { TypedMessage, TypedMessageTuple } from '@masknet/shared'
import type { Emitter } from '@servie/events'
import type { Subscription } from 'use-subscription'

export namespace Plugin {
    /**
     * A code loader interface of the plugin API.
     *
     * Plugin should be lazy-loaded. If a plugin is not enabled, it will not be loaded into the Mask.
     *
     * @example
     * ```ts
     * const loader = {
     *     load: () => import('./code'),
     *     hotModuleReload: hot => import.meta.webpackHot && import.meta.webpackHot.accept('./code', () => hot(import('./code')))
     * }
     * ```
     *
     * The `./code` should use `export default` to export what loader expects.
     */
    export interface Loader<DeferredModule> {
        /**
         * The `load()` function will be called on demand.
         *
         * It should not have side effects (e.g. start some daemon, start a new HTTP request or WebSocket client),
         * those work should be in the `.init()` function.
         * @returns the actual definition of this plugin
         * @example load: () => import('./path')
         */
        load(): Promise<{ default: DeferredModule }>
        /**
         * This provides the functionality for hot module reload on the plugin.
         * When the callback is called, the old instance of the plugin will be unloaded, then the new instance will be init.
         * @example hotModuleReload: hot => import.meta.webpackHot && import.meta.webpackHot.accept('./path', () => hot(import('./path')))
         */
        hotModuleReload(onHot: (hot: Promise<{ default: DeferredModule }>) => void): void
    }
    /**
     * DeferredDefinition should not contain any functionality of the plugin expects the loader.
     * If the plugin is not providing some of the functionality, please can omit that field.
     */
    export interface DeferredDefinition extends Shared.Definition {
        /** Load the SNSAdaptor part of the plugin. */
        SNSAdaptor?: Loader<SNSAdaptor.Definition>
        /** Load the Dashboard part of the plugin. */
        Dashboard?: Loader<Dashboard.Definition>
        /** Load the Worker part of the plugin. */
        Worker?: Loader<Worker.Definition>
    }
}
/**
 * Basic knowledge of the plugin (ID, name, publisher, ...).
 */
export namespace Plugin.Shared {
    export interface Definition {
        /**
         * ID of the plugin. It should be unique.
         * @example "com.mask.wallet"
         */
        ID: string
        /**
         * The human readable name of the plugin.
         * @example { i18nKey: "name", fallback: "Never gonna give you up" }
         */
        name: I18NStringField
        /**
         * Emoji icon of this plugin, used to display the plugin with a fancy shape.
         * @example "🎶"
         */
        icon?: string | React.ReactNode
        /**
         * A brief description of this plugin.
         * @example { i18nKey: "description", fallback: "This plugin is going to replace every link in the page to https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
         */
        description?: I18NStringField
        /**
         * Publisher of this plugin.
         * @example { link: "https://github.com/Dimensiondev", name: { fallback: "Mask Network", i18nKey: "org_name" } }
         */
        publisher?: Publisher
        /**
         * Configuration of what environment that this plugin expects to run in.
         */
        enableRequirement: EnableRequirement
        /**
         * Is this plugin marked as "experimental"?
         *
         * If the enableRequirement.target is not "stable", it will be treated as true.
         *
         * This does not affect if the plugin enable or not.
         */
        experimentalMark?: boolean
        /** Configuration of how this plugin is managed by the Mask Network. */
        management?: ManagementProperty
        /** i18n resources of this plugin */
        i18n?: I18NResource
        /** Introduce networks information. */
        networks?: Network[]
        /** Introduce wallet providers information. */
        providers?: Provider[]
    }
    /**
     * This part is shared between Dashboard, SNSAdaptor and Worker part
     * which you should include the information above in those three parts.
     */
    export interface DefinitionDeferred<Context = undefined> extends Definition, Utilities {
        /**
         * This function is called when the plugin is initialized.
         *
         * The plugin must clean up all side effects it creates when the `AbortSignal` provided aborts
         * to make sure the plugin can be reloaded safely.
         */
        init(signal: AbortSignal, context: Context): void | Promise<void>
    }
    export interface Utilities {
        /**
         * A pure function that convert a TypedMessage into another one
         */
        typedMessageTransformer?: TypedMessageTransformer
    }
    export type TypedMessageTransformer = (message: TypedMessageTuple) => TypedMessageTuple
    /** The publisher of the plugin */
    export interface Publisher {
        /** The name of the publisher */
        name: I18NStringField
        /** URL of the publisher */
        link: string
    }
    /** For what stage the plugin should be included in the Mask. */
    export type ReleaseStages = 'stable' | 'beta' | 'insider'
    /**
     * The condition that expected to start the plugin.
     *
     * If the condition changes and becomes invalid, the plugin will be unloaded.
     */
    export interface EnableRequirement {
        target: ReleaseStages
        architecture: Record<'app' | 'web', boolean>
        /** The SNS Network this plugin supports. */
        networks: SupportedNetworksDeclare
        web3?: Web3EnableRequirement
    }
    export interface Web3EnableRequirement {
        /** Plugin can declare what chain it supports. When the current chain is not supported, the composition entry will be hidden. */
        operatingSupportedChains?: number[]
    }

    export interface ManagementProperty {
        /** This plugin should not displayed in the plugin management page. */
        internal?: boolean
        /**
         * This plugin should not allow to be "disabled" in the plugin management page.
         *
         * This property is for the Wallet plugin. It's the core of almost all other plugins.
         *
         * It should be replaced by "dependency" management in the future (if there are more cases than the Wallet one).
         */
        alwaysOn?: boolean
    }
    export interface SupportedNetworksDeclare {
        /**
         * opt-in means the listed networks is supported.
         * out-out means the listed networks is not supported.
         */
        type: 'opt-in' | 'opt-out'
        networks: Partial<Record<CurrentSNSNetwork, boolean>>
    }
    export type I18NLanguage = string
    export type I18NKey = string
    export type I18NValue = string
    export type I18NResource = Record<I18NLanguage, Record<I18NKey, I18NValue>>

    export interface Network {
        /** An unique ID for each network */
        ID: string
        /** The plugin ID */
        pluginID: string
        /** The network type */
        type: string
        /** The network icon */
        icon: string
        /** The network name */
        name: string
    }

    export interface Provider {
        /** An unique ID for each wallet provider */
        ID: string
        /** The plugin ID */
        pluginID: string
        /** The provider type */
        type: string
        /** The provider icon */
        icon: string
        /** The provider name */
        name: string
    }

    export interface Web3UI {
        SelectProviderDialog?: {
            /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
            NetworkIconClickBait?: React.ComponentType<{ network: Shared.Network; children?: React.ReactNode }>
            /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
            ProviderIconClickBait?: React.ComponentType<{
                network: Shared.Network
                provider: Shared.Provider
                children?: React.ReactNode
            }>
        }
        Dashboard?: {
            OverviewComponent?: React.ComponentType<{}>
            AssetsTableComponent?: React.ComponentType<{}>
            TransferTableComponent?: React.ComponentType<{}>
            HistoryTableComponent?: React.ComponentType<{}>
        }
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

    export interface CryptoPrice {
        [token: string]: {
            [key in CurrencyType]: number
        }
    }

    export interface ChainDetailed {
        name: string
        chainId: number
        fullName: string
        shortName: string
        chainName: string
        networkName: string
    }

    export interface Wallet {
        /** User define wallet name. Default address.prefix(6) */
        name: string
        /** The address of wallet */
        address: string
        /** yep: Mask Wallet, nope: External Wallet */
        hasStoredKeyInfo: boolean
        /** yep: Derivable Wallet. nope: UnDerivable Wallet */
        hasDerivationPath: boolean
    }

    export interface Pagination {
        /** The item size of each page. */
        size?: number
        /** The page index. */
        page?: number
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

    export interface Web3State {
        Shared?: {
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
        Asset?: {
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
        Token?: {
            addToken: <T extends unknown>(token: Token<T>) => Promise<void>
            removeToken: <T extends unknown>(token: Token<T>) => Promise<void>
            trustToken: <T extends unknown>(token: Token<T>) => Promise<void>
            blockToken: <T extends unknown>(token: Token<T>) => Promise<void>
        }
        Transaction?: {
            /** Get latest transactions of given account. */
            getTransactions: (
                address: string,
                providerType: string,
                networkType: string,
                pagination?: Pagination,
            ) => Promise<Transaction[]>
        }
        TokenList?: {
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
        Utils?: {
            isChainIdValid: (chainId: number, allowTestnet: boolean) => boolean
            getChainDetailed: (chainId: number) => ChainDetailed
            getFungibleTokenMetadata: <T extends unknown>(token: Token<T>) => Promise<FungibleTokenMetadata<T>>
            getNonFungibleTokenMetadata: <T extends unknown>(token: Token<T>) => Promise<NonFungibleTokenMetadata<T>>
        }
    }
}

/** This part runs in the SNSAdaptor */
export namespace Plugin.SNSAdaptor {
    export interface Definition extends Shared.DefinitionDeferred {
        /** This UI will be rendered for each post found. */
        PostInspector?: InjectUI<{}>
        /** This UI will be rendered for each decrypted post. */
        DecryptedInspector?: InjectUI<{ message: TypedMessage }>
        /** This UI will be rendered under the Search box of the SNS. */
        SearchBoxComponent?: InjectUI<{}>
        /** This UI will be rendered into the global scope of an SNS. */
        GlobalInjection?: InjectUI<{}>
        /** This is a chunk of web3 UIs to be rendered into various places of Mask UI. */
        Web3UI?: Shared.Web3UI
        /** This is the context of the currently chosen network. */
        Web3State?: Shared.Web3State
        /** This UI will be an entry to the plugin in the Composition dialog of Mask. */
        CompositionDialogEntry?: CompositionDialogEntry
        /** This UI will be use when there is known badges. */
        CompositionDialogMetadataBadgeRender?: CompositionMetadataBadgeRender
        /** This UI will be rendered as an entry in the toolbar (if the SNS has a Toolbar support) */
        ToolbarEntry?: ToolbarEntry
    }
    //#region Composition entry
    /**
     * The entry has two type:
     *
     * - Dialog type: This type is very common so it is supported as first class citizen.
     * - Custom type: Fallback choice if the dialog type cannot do what you want to do.
     */
    export type CompositionDialogEntry = CompositionDialogEntryCustom | CompositionDialogEntryDialog

    export interface CompositionDialogEntryCustom {
        /**
         * A label that will be rendered in the CompositionDialog as a chip.
         * @example {fallback: "🧧 Red Packet"}
         */
        label: I18NFieldOrReactNode
        /** This callback will be called when the user clicked on the chip. */
        onClick(): void
    }
    export interface CompositionDialogEntryDialog {
        /**
         * A label that will be rendered in the CompositionDialog as a chip.
         * @example {fallback: "🧧 Red Packet"}
         */
        label: I18NFieldOrReactNode
        /** A React dialog component that receives `open` and `onClose`. The dialog will be opened when the chip clicked. */
        dialog: React.ComponentType<CompositionDialogEntry_DialogProps>
        /**
         * If this option is true, the dialog will be always mounted even if the dialog is not opening.
         *
         * @default false
         */
        keepMounted?: boolean
    }
    export interface CompositionDialogEntry_DialogProps {
        open: boolean
        onClose(): void
    }
    export type CompositionMetadataBadgeRender =
        | CompositionMetadataBadgeRenderStatic
        | CompositionMetadataBadgeRenderDynamic
    export type CompositionMetadataBadgeRenderStatic = ReadonlyMap<string, CompositionMetadataBadgeRenderStaticMapper>
    export type CompositionMetadataBadgeRenderStaticMapper<T = any> = (metadata: T) => string | BadgeDescriptor | null
    export type CompositionMetadataBadgeRenderDynamic = (
        key: string,
        metadata: unknown,
    ) => string | BadgeDescriptor | null
    export interface BadgeDescriptor {
        text: string | React.ReactChild
        tooltip?: React.ReactChild
    }
    //#endregion

    //#region Toolbar entry
    export interface ToolbarEntry {
        image: string
        // TODO: remove string
        label: I18NStringField | string
        /**
         * Used to order the toolbars
         *
         * TODO: can we make them unordered?
         */
        priority: number
        /**
         * This is a React hook. If it returns false, this entry will not be displayed.
         */
        useShouldDisplay?(): boolean
        /**
         * What to do if the entry is clicked.
         */
        // TODO: add support for DialogEntry.
        // TODO: add support for onClick event.
        onClick: 'openCompositionEntry'
    }
    //#endregion
}

/** This part runs in the dashboard */
export namespace Plugin.Dashboard {
    // As you can see we currently don't have so much use case for an API here.
    export interface Definition extends Shared.DefinitionDeferred {
        /** This UI will be injected into the global scope of the Dashboard. */
        GlobalInjection?: InjectUI<{}>
        /** This is a chunk of web3 UIs to be rendered into various places of Mask UI. */
        Web3UI?: Shared.Web3UI
        /** This is the context of the currently chosen network. */
        Web3State?: Shared.Web3State
    }
}

/** This part runs in the background page */
export namespace Plugin.Worker {
    export interface WorkerContext {
        getStorage<T extends IndexableTaggedUnion>(): Storage<T>
    }
    export interface Definition extends Shared.DefinitionDeferred<WorkerContext> {
        backup?: BackupHandler
    }
    export interface BackupHandler {
        /**
         * This function will be called when user try to generate a new backup.
         * The return value will contribute to the backup file.
         *
         * If it returns a None, it will not contributes to the backup file.
         *
         * If it returns a Some<T>, T will be serialized by JSON.stringify and added into the backup file.
         */
        onBackup(): Promise<Option<unknown>>
        /**
         * This function will be called when the user try to restore a backup file,
         * and there is some data associated with this plugin.
         *
         * @param data The serialized backup content previously returned by `onBackup`.
         * You MUST treat the data as untrustful content because it can be modified by the user.
         */
        onRestore(data: unknown): Promise<Result<void, Error>>
    }
    /**
     * @typeParameter Data It should be a [tagged union](https://en.wikipedia.org/wiki/Tagged_union) with an extra `id` field
     * @example
     *
     * type File = { type: 'file'; name: string; id: string }
     * type Folder = { type: 'folder'; file: string[]; id: string }
     * const Storage: Plugin.Worker.Storage<File | Folder> = context.storage
     * const file: File = { type: 'file', name: 'file.txt', id: uuid() }
     * const folder: Folder = { type: 'folder', file: [file.id], id: uuid() }
     * // Add new data
     * await Storage.add(file)
     * await Storage.add(folder)
     * // Remove
     * await Storage.remove('file', file.id)
     * // Query
     * const result: File | undefined = await Storage.get('file', file.id)
     * const has: boolean = await Storage.has('file', file.id)
     * // iterate
     * for await (const { value } of Storage.iterate('file')) {
     *     // read only during the for...await loop
     *     // !! NO: await Storage.remove('file', file.id)
     *     console.log(value.name)
     * }
     * for await (const cursor of Storage.iterate_mutate('folder')) {
     *     cursor.value // Folder
     *     await cursor.update({ ...cursor.value, file: [] })
     *     await cursor.delete()
     * }
     */
    export interface Storage<Data extends IndexableTaggedUnion = IndexableTaggedUnion> {
        /**
         * Query an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        get<T extends Data['type']>(type: T, id: Data['id']): Promise<(Data & { type: T }) | undefined>
        has<T extends Data['type']>(type: T, id: Data['id']): Promise<boolean>
        /**
         * Store a data into the database.
         * @param data Must be an object with "type" and "id"
         */
        add(data: Data): Promise<void>
        /**
         * Remove an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        remove<T extends Data['type']>(type: T, id: Data['id']): Promise<void>
        /**
         * Iterate over the database of given type (readonly!)
         *
         * !!! During the iterate, you MUST NOT do anything that writes to the store (use iterate_mutate instead)
         *
         * !!! You MUST NOT do anything asynchronous before the iterate ends
         *
         * !!! Otherwise the transaction will be inactivate
         * @param type "type" field on the object
         */
        iterate<T extends Data['type']>(type: T): AsyncIterableIterator<StorageReadonlyCursor<Data, T>>
        /**
         * Iterate over the database of given type (read-write).
         *
         * !!! You MUST NOT do anything asynchronous before the iterate ends
         *
         * !!! Otherwise the transaction will be inactivate
         * @param type "type" field on the object
         */
        iterate_mutate<T extends Data['type']>(type: T): AsyncIterableIterator<StorageMutableCursor<Data, T>>
    }
    export interface StorageReadonlyCursor<Data extends IndexableTaggedUnion, T extends Data['type']> {
        value: Data & { type: T }
        // continueTo(id: Data['id']): Promise<void>
    }
    export interface StorageMutableCursor<Data extends IndexableTaggedUnion, T extends Data['type']>
        extends StorageReadonlyCursor<Data, T> {
        delete: () => Promise<void>
        update: (data: Data & { type: T }) => Promise<void>
    }
}

// Helper types
export namespace Plugin {
    /**
     * Injected UI. There're two kinds
     * - InjectUIReact: Optimized for React component.
     * - InjectUIRaw: The fallback choice if a React component doesn't apply here.
     */
    export type InjectUI<Props> = InjectUIRaw<Props> | InjectUIReact<Props>
    /**
     *
     * @example
     * ```ts
     * const ui = {
     *      type: 'raw' as const,
     *      init(signal, dom) {
     *          return props => dom.innerHTML = toString(props)
     *      }
     * }
     * ```
     */
    export type InjectUIRaw<Props> = {
        type: 'raw'
        /**
         * The raw version of the inject UI.
         * @param signal The AbortSignal. You should undo side effects when the signal aborts.
         * @param mountingPoint The mounting DOM
         * @returns A function that will be called each time if the `props` has changed
         */
        init(signal: AbortSignal, mountingPoint: HTMLDivElement): (props: Props) => void
    }
    export type InjectUIReact<Props> = React.ComponentType<Props>
}

export type IndexableTaggedUnion = {
    type: string | number
    id: string | number
}
// TODO: Plugin i18n is not read today.
export interface I18NStringField {
    /** The i18n key of the string content. */
    i18nKey?: string
    /** The fallback content to display if there is no i18n string found. */
    fallback: string
}
export type I18NFieldOrReactNode = I18NStringField | React.ReactNode

/**
 * The current running SocialNetwork.
 */
export enum CurrentSNSNetwork {
    Unknown = 0,
    Facebook = 1,
    Twitter = 2,
    Instagram = 3,
}

/**
 * This namespace is not related to the plugin authors
 */
// ---------------------------------------------------
export namespace Plugin.__Host {
    export interface Host<Context = undefined> {
        enabled: EnabledStatusReporter
        addI18NResource(pluginID: string, resources: Plugin.Shared.I18NResource): void
        createContext(id: string, signal: AbortSignal): Context
        signal?: AbortSignal
    }
    export interface EnabledStatusReporter {
        isEnabled(id: string): boolean | Promise<boolean>
        events: Emitter<{ enabled: [id: string]; disabled: [id: string] }>
    }
}
