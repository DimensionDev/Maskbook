/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import type {
    BindingProof,
    ECKeyIdentifier,
    EnhanceableSite,
    ExtensionSite,
    NetworkPluginID,
    NextIDPlatform,
    PostIdentifier,
    PersonaIdentifier,
    PersonaInformation,
    PluginID,
    PopupRoutes,
    ProfileIdentifier,
    ScopedStorage,
} from '@masknet/shared-base'
import type { TypedMessage } from '@masknet/typed-message'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { LogHubBase } from '@masknet/web3-providers/types'
import type {
    ChainDescriptor,
    NetworkDescriptor,
    ProviderDescriptor,
    SearchResult,
    SocialAccount,
    SocialIdentity,
    ThemeSettings,
    Wallet,
    Web3EnableRequirement,
    Web3State,
    Web3UI,
} from '@masknet/web3-shared-base'
import type { ChainId as ChainIdEVM, Transaction as TransactionEVM } from '@masknet/web3-shared-evm'
import type { Emitter } from '@servie/events'
import type React from 'react'
import type { Option, Result } from 'ts-results-es'
import type { Subscription } from 'use-subscription'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { CompositionType } from './entry-content-script.js'

export declare namespace Plugin {
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
        load(): Promise<{
            default: DeferredModule
        }>

        /**
         * This provides the functionality for hot module reload on the plugin.
         * When the callback is called, the old instance of the plugin will be unloaded, then the new instance will be init.
         * @example hotModuleReload: hot => import.meta.webpackHot && import.meta.webpackHot.accept('./path', () => hot(import('./path')))
         */
        hotModuleReload(
            onHot: (
                hot: Promise<{
                    default: DeferredModule
                }>,
            ) => void,
        ): void
    }

    /**
     * DeferredDefinition should not contain any functionality of the plugin expects the loader.
     * If the plugin is not providing some of the functionality, please can omit that field.
     */
    export interface DeferredDefinition<
        ChainId = unknown,
        AddressType = unknown,
        SchemaType = unknown,
        ProviderType = unknown,
        NetworkType = unknown,
        Signature = unknown,
        GasOption = unknown,
        Block = unknown,
        Transaction = unknown,
        TransactionReceipt = unknown,
        TransactionDetailed = unknown,
        TransactionSignature = unknown,
        TransactionParameter = unknown,
        Web3 = unknown,
        Web3Provider = unknown,
    > extends Shared.Definition<ChainId, SchemaType, ProviderType, NetworkType> {
        /** Load the SNSAdaptor part of the plugin. */
        SNSAdaptor?: Loader<
            SNSAdaptor.Definition<
                ChainId,
                AddressType,
                SchemaType,
                ProviderType,
                NetworkType,
                Signature,
                GasOption,
                Block,
                Transaction,
                TransactionReceipt,
                TransactionDetailed,
                TransactionSignature,
                TransactionParameter,
                Web3,
                Web3Provider
            >
        >
        /** Load the Dashboard part of the plugin. */
        Dashboard?: Loader<
            Dashboard.Definition<
                ChainId,
                AddressType,
                SchemaType,
                ProviderType,
                NetworkType,
                Signature,
                GasOption,
                Block,
                Transaction,
                TransactionReceipt,
                TransactionDetailed,
                TransactionSignature,
                TransactionParameter,
                Web3,
                Web3Provider
            >
        >
        /** Load the Worker part of the plugin. */
        Worker?: Loader<Worker.Definition>
    }
}
/**
 * Basic knowledge of the plugin (ID, name, publisher, ...).
 */
export namespace Plugin.Shared {
    export interface SharedContext {
        /**
         * A lightweight K/V storage used to store some simple data.
         */
        createKVStorage<T extends object>(type: 'memory' | 'persistent', defaultValues: T): ScopedStorage<T>
        /**
         * A Logger.
         */
        createLogger(): LogHubBase | undefined
    }

    export interface SharedUIContext extends SharedContext {
        allPersonas?: Subscription<PersonaInformation[]>
        /** The selected account of Mask Wallet */
        account: Subscription<string>
        /** The selected chainId of Mask Wallet */
        chainId: Subscription<ChainIdEVM>
        /** The selected persona */
        currentPersona: Subscription<PersonaIdentifier | undefined>
        /** Get all wallets */
        wallets: Subscription<Wallet[]>

        /** Native platform type */
        nativeType?: 'Android' | 'iOS'
        /** Native API supported */
        hasNativeAPI: boolean

        /** Send request to native API */
        send(
            payload: JsonRpcPayload,
            options?: {
                account?: string
                chainId?: ChainIdEVM
                popupsWindow?: boolean
            },
        ): Promise<JsonRpcResponse>

        /** Open popup window */
        openPopupWindow(route?: PopupRoutes, params?: Record<string, any>): Promise<void>

        /** Close popup window */
        closePopupWindow(): Promise<void>

        /** Open popup connect window */
        openPopupConnectWindow(): Promise<void>

        /** Open walletconnect dialog */
        openWalletConnectDialog(uri: string, callback: () => void): void

        /** Close walletconnect dialog */
        closeWalletConnectDialog(): void

        /** Select a Mask Wallet account */
        selectAccount(): Promise<Array<{ address: string; owner?: string; identifier?: ECKeyIdentifier }>>

        /** Update Mask Wallet account */
        updateAccount(account: {
            account?: string
            chainId?: number
            networkType?: string
            providerType?: string
        }): Promise<void>

        /** Record which sites are connected to the Mask wallet  */
        recordConnectedSites(site: EnhanceableSite | ExtensionSite, connected: boolean): void

        /** Sign a message with persona */
        personaSignMessage(payload: PersonaSignRequest): Promise<PersonaSignResult>

        personaSignPayMessage(payload: Omit<PersonaSignRequest, 'method'>): Promise<string>
        /** Generate sign message with persona */
        generateSignResult(signer: ECKeyIdentifier, message: string): Promise<PersonaSignResult>

        /** Sign transaction */
        signTransaction(address: string, transaction: TransactionEVM): Promise<string>

        /** Sign personal message, aka. eth.personal.sign() */
        signPersonalMessage(message: string, address: string): Promise<string>

        /** Sign typed data */
        signTypedData(address: string, message: string): Promise<string>

        /** Get all wallets */
        getWallets(): Promise<Wallet[]>

        /** Add a new wallet */
        addWallet(id: string, wallet: Wallet): Promise<void>

        /** Update a wallet */
        updateWallet(id: string, wallet?: Partial<Wallet>): Promise<void>

        /** Remove a old wallet */
        removeWallet(id: string, password?: string): Promise<void>
    }

    export interface Definition<
        ChainId = unknown,
        SchemaType = unknown,
        ProviderType = unknown,
        NetworkType = unknown,
    > {
        /**
         * ID of the plugin. It should be unique.
         * @example "com.mask.wallet"
         */
        ID: PluginID
        /**
         * The human readable name of the plugin.
         * @example { i18nKey: "name", fallback: "Never gonna give you up" }
         */
        name: I18NStringField
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
        /**
         * If the plugin is in the minimal mode by default.
         */
        inMinimalModeByDefault?: boolean
        /** i18n resources of this plugin */
        i18n?: I18NResource
        /** Introduce sub-network information. */
        declareWeb3Chains?: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>
        /** Introduce networks information. */
        declareWeb3Networks?: Array<NetworkDescriptor<ChainId, NetworkType>>
        /** Introduce wallet providers information. */
        declareWeb3Providers?: Array<ProviderDescriptor<ChainId, ProviderType>>
        /**
         * Declare what this plugin provides.
         *
         * Declare this field properly so Mask Network can suggest your plugin when needed.
         */
        contribution?: Contribution
        /** Declare ability this plugin supported. */
        ability?: Ability
    }

    /**
     * This part is shared between Dashboard, SNSAdaptor and Worker part
     * which you should include the information above in those three parts.
     */
    export interface DefinitionDeferred<Context extends Shared.SharedContext = Shared.SharedContext>
        extends Definition,
            Utilities {
        /**
         * This function is called when the plugin is initialized.
         *
         * The plugin must clean up all side effects it creates when the `AbortSignal` provided aborts
         * to make sure the plugin can be reloaded safely.
         */
        init(signal: AbortSignal, context: Context): void | Promise<void>
    }

    export interface Utilities {}

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
        /** The Web3 Network this plugin supports */
        web3?: Web3EnableRequirement
        /**
         * Requested origins.
         * Only put necessary permissions here.
         * https://developer.chrome.com/docs/extensions/mv3/match_patterns/
         */
        host_permissions?: string[]
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

    export interface Contribution {
        /** This plugin can recognize and react to the following metadata keys. */
        metadataKeys?: ReadonlySet<string>
        /** This plugin can recognize and enhance the post that matches the following matchers. */
        postContent?: ReadonlySet<RegExp | string>
    }

    export interface Ability {}

    export interface PersonaSignRequest {
        /** The message to be signed. */
        message: string
        /** Use what method to sign this message? */
        method: 'eth'
        identifier: PersonaIdentifier
    }

    export interface PersonaSignResult {
        /** The persona user selected to sign the message */
        persona: PersonaIdentifier
        signature: {
            // type from ethereumjs-util
            // raw: ECDSASignature
            EIP2098: string
            signature: string
        }
        /** Persona converted to a wallet address */
        address: string
        /** Message in hex */
        messageHex: string
    }
}

/** This part runs in the SNSAdaptor */
export namespace Plugin.SNSAdaptor {
    export interface SNSAdaptorContext extends Shared.SharedUIContext {
        lastRecognizedProfile: Subscription<IdentityResolved | undefined>
        currentVisitingProfile: Subscription<IdentityResolved | undefined>
        allPersonas?: Subscription<PersonaInformation[]>
        themeSettings: Subscription<ThemeSettings | undefined>
        /** The default theme settings. */
        getThemeSettings: () => ThemeSettings | undefined
        getNextIDPlatform: () => NextIDPlatform | undefined
        getPersonaAvatar: (identifier: ECKeyIdentifier | null | undefined) => Promise<string | null | undefined>
        getSocialIdentity: (
            platform: NextIDPlatform,
            identity: IdentityResolved | undefined,
        ) => Promise<SocialIdentity | undefined>
        ownProofChanged: UnboundedRegistry<void>
        setMinimalMode: (id: string, enabled: boolean) => Promise<void>

        getPostURL?: (identifier: PostIdentifier) => URL | null
        share?: (text: string) => void
    }

    export type SelectProviderDialogEvent =
        | {
              open: true
              pluginID?: NetworkPluginID
          }
        | {
              open: false
              address?: string
          }

    export interface PersonaSignResult {
        /** The persona user selected to sign the message */
        persona: PersonaIdentifier
        signature: {
            // type from ethereumjs-util
            // raw: ECDSASignature
            EIP2098: string
            signature: string
        }
        /** Persona converted to a wallet address */
        address: string
        /** Message in hex */
        messageHex: string
    }

    export interface Definition<
        ChainId = unknown,
        AddressType = unknown,
        SchemaType = unknown,
        ProviderType = unknown,
        NetworkType = unknown,
        Signature = unknown,
        GasOption = unknown,
        Block = unknown,
        Operation = unknown,
        Transaction = unknown,
        TransactionReceipt = unknown,
        TransactionDetailed = unknown,
        TransactionSignature = unknown,
        TransactionParameter = unknown,
        Web3 = unknown,
        Web3Provider = unknown,
    > extends Shared.DefinitionDeferred<SNSAdaptorContext> {
        /** This UI will be rendered for each post found. */
        PostInspector?: InjectUI<{}>
        /** This UI will be rendered for action of each post found. */
        PostActions?: InjectUI<{}>
        /** This UI will be rendered for each decrypted post. */
        DecryptedInspector?: InjectUI<{
            message: TypedMessage
        }>
        /** This UI will be rendered into the global scope of an SNS. */
        GlobalInjection?: InjectUI<{}>
        /** This UI will be rendered under the Search result of SNS */
        SearchResultInspector?: SearchResultInspector
        /** This UI will be rendered under the Search result of SNS. */
        SearchResultTabs?: SearchResultTab[]
        /**
         * @deprecated Use SearchResultInspector stead
         * This is the detailed UI content that will be rendered under the Search of the SNS. */
        SearchResultContent?: SearchResultContent
        /** This is a chunk of web3 UIs to be rendered into various places of Mask UI. */
        Web3UI?: Web3UI<ChainId, ProviderType, NetworkType>
        /** This is the context of the currently chosen network. */
        Web3State?: Web3State<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            NetworkType,
            Signature,
            GasOption,
            Block,
            Operation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            TransactionParameter,
            Web3,
            Web3Provider
        >
        /** This UI will be an entry to the plugin in the Composition dialog of Mask. */
        readonly CompositionDialogEntry?: CompositionDialogEntry
        /** This UI will be use when there is known badges. */
        CompositionDialogMetadataBadgeRender?: CompositionMetadataBadgeRender
        /** This UI will be rendered as an entry in the wallet status dialog */
        ApplicationEntries?: ApplicationEntry[]
        /** This UI will be rendered as tabs on the profile page */
        ProfileTabs?: ProfileTab[]
        /** This UI will be rendered as tabs on the profile card */
        ProfileCardTabs?: ProfileTab[]
        /** This UI will be rendered as cover on the profile page */
        ProfileCover?: ProfileCover[]
        /** This UI will be rendered as tab on the setting dialog */
        SettingTabs?: SettingTab[]
        /** This UI will be rendered components on the avatar realm */
        AvatarRealm?: AvatarRealm
        /** This UI will be shared across plugins */
        Widgets?: Widget[]
        // Widgets?: {
        //     [key in keyof WidgetRegistry]: Widget<WidgetRegistry[key]>
        // }
        /** This UI will be rendered components on the tips realm */
        TipsRealm?: TipsRealm
        /** This UI will be rendered as plugin wrapper page */
        wrapperProps?: PluginWrapperProps
        /**
         * A hook for if this plugin can enhance the #hash or $cash tag.
         */
        enhanceTag?: {
            onClick?: (kind: 'cash' | 'hash', content: string, event: React.MouseEvent<HTMLAnchorElement>) => void
            onHover?: (
                kind: 'cash' | 'hash',
                content: string,
                event: React.MouseEvent<HTMLAnchorElement>,
                chainId: ChainId,
            ) => () => void
        }
    }

    // #region Composition entry
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
        onClick(options: { compositionType: CompositionType; metadata: ReadonlyMap<string, unknown> | undefined }): void
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

        isOpenFromApplicationBoard?: boolean
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
        text: string | React.ReactNode
        tooltip?: React.ReactNode
    }

    // #endregion

    export interface ApplicationEntry {
        /**
         * The contrast between ApplicationEntryID and PluginID is that one plugin may contains multiple entries.
         */
        ApplicationEntryID: string
        /**
         * Render entry component
         */
        RenderEntryComponent?: (props: {
            disabled: boolean
            tooltipHint?: string
            onClick?: (walletConnectedCallback?: () => void) => void
            popperBoundary?: HTMLElement | null
        }) => JSX.Element | null
        /**
         * Used to order the applications on the board
         */
        appBoardSortingDefaultPriority?: number

        /**
         * Used to order the applications on the market list
         */
        marketListSortingPriority?: number

        icon: React.ReactNode

        name: I18NFieldOrReactNode

        description?: I18NFieldOrReactNode

        iconFilterColor?: string

        tutorialLink?: string
        /**
         * Does the application listed in the DAPP list
         */
        category?: 'dapp' | 'other'

        nextIdRequired?: boolean
        /**
         * One plugin may has multiple part. E.g. Tips requires connected wallet, but Tips setting not.
         */
        entryWalletConnectedNotRequired?: boolean

        /**
         * Display using an eye-catching card and unable to be unlisted.
         */
        recommendFeature?: {
            description: React.ReactNode
            backgroundGradient: string
            isFirst?: boolean
        }
        features?: Array<{
            name: I18NFieldOrReactNode
            description: I18NFieldOrReactNode
        }>
    }

    export interface PluginWrapperProps {
        icon?: React.ReactNode
        title?: string | React.ReactNode
        backgroundGradient?: string
        borderRadius?: string
        margin?: string
    }

    export interface SearchResultInspector {
        ID: string
        /**
         * The injected UI
         */
        UI?: {
            /** The brief content above detailed tabs. */
            Content?: InjectUI<{
                result: Array<SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
                isProfilePage?: boolean
            }>
        }
        Utils?: {
            shouldDisplay?(result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>): boolean
        }
    }

    export interface SearchResultTab {
        ID: string

        /**
         * The name of the slider card
         */
        label: I18NStringField | string
        /**
         * Used to order the sliders
         */
        priority: number
        /**
         * The injected UI
         */
        UI?: {
            /**
             * The injected tab content
             */
            TabContent: InjectUI<{
                result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
            }>
        }
        Utils?: {
            shouldDisplay?(result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>): boolean
        }
    }

    export interface SearchResultContent {
        ID: string
        UI?: {
            Content?: React.ForwardRefExoticComponent<{ keyword: string } & React.RefAttributes<unknown>>
        }
    }

    export enum AvatarRealmSourceType {
        ProfilePage = 'ProfilePage',
        ProfileCard = 'ProfileCard',
        Post = 'Post',
        Editor = 'Editor',
        Menu = 'Menu',
        Suggestion = 'Suggestion',
    }

    export interface AvatarRealm {
        ID: string
        priority: number
        label: I18NStringField | string
        UI?: {
            /**
             * The injected avatar decorator component
             */
            Decorator: InjectUI<{
                identity?: SocialIdentity
                persona?: string
                socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
            }>
            /**
             * The injected avatar settings button component
             */
            Settings?: InjectUI<{
                identity?: SocialIdentity
                persona?: string
                socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
            }>
        }
        Utils?: {
            /**
             * If it returns false, this cover will not be displayed.
             */
            shouldDisplay?(
                identity?: SocialIdentity,
                socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>,
                sourceType?: AvatarRealmSourceType,
            ): boolean
        }
    }

    export enum TipsSlot {
        FollowButton = 'follow',
        FocusingPost = 'focusing-post',
        Post = 'post',
        Profile = 'profile',
        MirrorMenu = 'mirror-menu',
        MirrorEntry = 'mirror-entry',
    }

    export interface TipsRealmOptions {
        identity?: ProfileIdentifier
        slot: TipsSlot
        accounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
        iconSize?: number
        buttonSize?: number

        onStatusUpdate?(disabled: boolean): void
    }

    export interface TipsRealm {
        ID: string
        priority: number
        UI?: {
            /**
             * The injected Tips Content component
             */
            Content: InjectUI<TipsRealmOptions>
        }
    }

    export interface ProfileSlider {
        ID: string

        /**
         * The name of the slider card
         */
        label: I18NStringField | string
        /**
         * Used to order the sliders
         */
        priority: number
        /**
         * The injected UI
         */
        children: InjectUI<{}>
    }

    export interface ProfileTab {
        ID: string

        /**
         * The name of the tab
         */
        label: I18NStringField | string

        /**
         * Used to order the sliders
         */
        priority: number

        UI?: {
            /**
             * The injected tab content
             */
            TabContent: InjectUI<{
                identity?: SocialIdentity
                socialAccount?: SocialAccount<Web3Helper.ChainIdAll>
            }>
        }
        Utils?: {
            /**
             * If it returns false, this tab will not be displayed.
             */
            shouldDisplay?(identity?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>): boolean
            /**
             * Filter social address.
             */
            filter?: (x: SocialAccount<Web3Helper.ChainIdAll>) => boolean
            /**
             * Sort social address in expected order.
             */
            sorter?: (a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>) => number
        }
    }

    export interface ProfileCover {
        ID: string

        /**
         * The name of the cover
         */
        label: I18NStringField | string

        /**
         * Used to order the sliders
         */
        priority: number

        UI?: {
            /**
             * The injected cover component
             */
            Cover: InjectUI<{
                identity?: SocialIdentity
                socialAccounts?: SocialAccount<Web3Helper.ChainIdAll>
            }>
        }
        Utils: {
            /**
             * If it returns false, this cover will not be displayed
             */
            shouldDisplay?(identity?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>): boolean
            /**
             * Filter social account
             */
            filterSocialAccount?(x: SocialAccount<Web3Helper.ChainIdAll>): boolean
            /**
             * Sort social account in expected order
             */
            sortSocialAccount?(a: SocialAccount<Web3Helper.ChainIdAll>, z: SocialAccount<Web3Helper.ChainIdAll>): number
        }
    }

    export interface SettingTab {
        ID: PluginID
        /**
         * The name of setting tab
         */
        label: I18NStringField | string

        /**
         * Used to order the tabs
         */
        priority: number

        UI?: {
            TabContent: InjectUI<{
                onClose: () => void
                onOpenPopup: (route?: PopupRoutes, params?: Record<string, any>) => void
                bindingWallets?: BindingProof[]
                currentPersona?: ECKeyIdentifier
                pluginID: PluginID
            }>
        }
    }

    /** Contribute a widget to other plugins. */
    export interface Widget {
        ID: string

        name: keyof WidgetRegistry

        label: I18NStringField | string

        UI?: {
            Widget: InjectUI<{}>
        }
    }

    export interface WidgetRegistry {
        example: {}
    }
}

/** This part runs in the dashboard */
export namespace Plugin.Dashboard {
    export interface DashboardContext extends Shared.SharedUIContext {}

    // As you can see we currently don't have so much use case for an API here.
    export interface Definition<
        ChainId = unknown,
        AddressType = unknown,
        SchemaType = unknown,
        ProviderType = unknown,
        NetworkType = unknown,
        Signature = unknown,
        GasOption = unknown,
        Block = unknown,
        Operation = unknown,
        Transaction = unknown,
        TransactionReceipt = unknown,
        TransactionDetailed = unknown,
        TransactionSignature = unknown,
        TransactionParameter = unknown,
        Web3 = unknown,
        Web3Provider = unknown,
    > extends Shared.DefinitionDeferred<DashboardContext> {
        /** This UI will be injected into the global scope of the Dashboard. */
        GlobalInjection?: InjectUI<{}>
        /** This is a chunk of web3 UIs to be rendered into various places of Mask UI. */
        Web3UI?: Web3UI<ChainId, ProviderType, NetworkType>
        /** This is the context of the currently chosen network. */
        Web3State?: Web3State<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            NetworkType,
            Signature,
            GasOption,
            Block,
            Operation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            TransactionParameter,
            Web3,
            Web3Provider
        >
        /** Plugin DO NOT need to define this. This will be auto set by the plugin host. */
        __general_ui__?: GeneralUI.DefinitionDeferred
    }
}

/** This part runs in the background page */
export namespace Plugin.Worker {
    export interface WorkerContext extends Shared.SharedContext {
        getDatabaseStorage<T extends IndexableTaggedUnion>(): DatabaseStorage<T>
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
    export interface DatabaseStorage<Data extends IndexableTaggedUnion = IndexableTaggedUnion> {
        /**
         * Query an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        get<T extends Data['type']>(
            type: T,
            id: Data['id'],
        ): Promise<
            | (Data & {
                  type: T
              })
            | undefined
        >

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
        value: Data & {
            type: T
        }
    }

    export interface StorageMutableCursor<Data extends IndexableTaggedUnion, T extends Data['type']>
        extends StorageReadonlyCursor<Data, T> {
        delete: () => Promise<void>
        update: (
            data: Data & {
                type: T
            },
        ) => Promise<void>
    }
}

/** This part defines the plugin part that does not context aware. */
export namespace Plugin.GeneralUI {
    export interface DefinitionDeferred {
        /**
         * Render metadata in many different environments.
         *
         * 1. Environment
         *
         * The render component MUST NOT assume they are running in a specific environment (e.g. SNS Adaptor).
         * Plugin messages and RPC MAY NOT working.
         *
         * It MUST NOT assume the environment using the `context` props.
         * ALL actions MUST BE DONE with the given props.
         *
         * Here is some example of *possible* environments.
         * - inside SNS Adaptor, given "composition" context, running in the CompositionDialog.
         * - inside SNS Adaptor, given "post" context,        running in the DecryptedPost.
         * - inside Dashboard,   given "post" context,        running in the PostHistory as the previewer.
         * - inside Popups,      given "post" context,        running in the PostInspector (Isolated mode).
         * - on mask.io,         given "post" context,        allowing preview the message without extension installed.
         *
         * 2. Contexts
         *
         * The render component might be used in many different contexts.
         *
         * - "composition" context, the render should be editable, but not interactive (e.g. allow vote).
         * - "post" context, the render should be readonly, but interactive.
         *
         * 3. Actions
         *
         * The render component MUST BE a ForwardRefExotic React Component
         * that support operations defined in `Plugin.ContextFree.MetadataRender.RenderActions`
         */
        metadataRender: MetadataRender.StaticRender | MetadataRender.DynamicRender
    }

    export namespace MetadataRender {
        export type MetadataReader<T> = (meta: TypedMessage['meta']) => Result<T, unknown>
        // #region Static render
        // new Map([ [reader, react component] ])
        export type StaticRender<T = any> = ReadonlyMap<MetadataReader<T>, StaticRenderComponent<T>>
        export type StaticRenderComponent<T> = Omit<React.ForwardRefExoticComponent<StaticRenderProps<T>>, 'propTypes'>
        export type StaticRenderProps<T> = Context<T> &
            React.RefAttributes<RenderActions<T>> & {
                metadata: T
            }
        // #endregion
        // #region DynamicRender
        export type DynamicRender = Omit<React.ForwardRefExoticComponent<DynamicRenderProps>, 'propTypes'>
        export type DynamicRenderProps = Context<unknown> &
            React.RefAttributes<RenderActions<unknown>> & {
                metadata: TypedMessage['meta']
            }
        // #endregion
        export type RenderActions<T> = {
            /**
             * This action make the render into the edit state.
             * It should report the result via onEditComplete() props.
             *
             * If this action does not exist, it will be rendered as non-editable.
             */
            edit?(): void
            /**
             * This action make the render quit the edit state.
             * If save is true, the render MUST report the new result via onEditComplete.
             *
             * If this action does not exist, the render should handle the save/cancel by themselves.
             */
            quitEdit?(save: boolean): void
        }
        export type Context<T> = CompositionContext<T> | DecryptedPostContext

        /** This metadata render is called in a composition preview context. */
        export interface CompositionContext<T> {
            context: 'composition'

            /**
             * When edit() is called, this component should go into to editable state.
             * If the edit completes, the new metadata will be used to replace the old one.
             */
            onEditComplete(metaKey: string, replaceMeta: T): void
        }

        /**
         * This metadata render is called in the decrypted post.
         */
        export interface DecryptedPostContext {
            context: 'post'
        }
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
     *          return props => dom.textContent = toString(props)
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
    Minds = 4,
}

export interface IdentityResolved {
    nickname?: string
    avatar?: string
    bio?: string
    homepage?: string
    identifier?: ProfileIdentifier
    isOwner?: boolean
}

/**
 * This namespace is not related to the plugin authors
 */
// ---------------------------------------------------
export namespace Plugin.__Host {
    export interface Host<Context = undefined> {
        /**
         * Control if the plugin is in the minimal mode.
         *
         * If it is in the minimal mode, it will be omitted in some cases.
         */
        minimalMode: EnabledStatusReporter

        addI18NResource(pluginID: string, resources: Plugin.Shared.I18NResource): void

        createContext(id: string, signal: AbortSignal): Context

        signal?: AbortSignal
        permission: PermissionReporter
    }

    export interface PermissionReporter {
        hasPermission(host_permission: string[]): Promise<boolean>

        events: Emitter<{ changed: [] }>
    }

    export interface EnabledStatusReporter {
        isEnabled(id: string): BooleanPreference | Promise<BooleanPreference>

        events: Emitter<{
            enabled: [id: string]
            disabled: [id: string]
        }>
    }
}

export enum BooleanPreference {
    False = 0,
    Default = 1,
    True = 2,
}
