import type React from 'react'
import type { Option, Result } from 'ts-results-es'
import type { Emitter } from '@servie/events'
/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import type {
    BindingProof,
    ECKeyIdentifier,
    NetworkPluginID,
    PluginID,
    ProfileIdentifier,
    ScopedStorage,
    SocialAccount,
    SocialIdentity,
    BooleanPreference,
    EnhanceableSite,
} from '@masknet/shared-base'
import type { TypedMessage } from '@masknet/typed-message'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import type { CompositionType } from './entry-content-script.js'
import type { JSX, ComponentType } from 'react'

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
    export interface DeferredDefinition extends Shared.Definition {
        /** Load the Site Adaptor part of the plugin. */
        SiteAdaptor?: Loader<SiteAdaptor.Definition>
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
    }

    export interface SharedUIContext extends SharedContext {
        setMinimalMode(enabled: boolean): void
    }

    export interface Definition {
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
        /**
         * Declare what this plugin provides.
         *
         * Declare this field properly so Mask Network can suggest your plugin when needed.
         */
        contribution?: Contribution
        /** Declare ability this plugin supported. */
        ability?: never
    }

    /**
     * This part is shared between Site Adaptor and Worker part
     * which you should include the information above in those three parts.
     */
    export interface DefinitionDeferred<Context extends SharedContext = SharedContext> extends Definition {
        /**
         * This function is called when the plugin is initialized.
         *
         * The plugin must clean up all side effects it creates when the `AbortSignal` provided aborts
         * to make sure the plugin can be reloaded safely.
         */
        init?(signal: AbortSignal, context: Context): void | Promise<void>
    }

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
        /** The website this plugin supports. */
        supports: SupportedSitesDeclare
        /** The Web3 Network this plugin supports */
        web3?: Partial<
            Record<
                NetworkPluginID,
                {
                    supportedChainIds?: number[]
                }
            >
        >
        /**
         * Requested origins.
         * Only put necessary permissions here.
         * https://developer.chrome.com/docs/extensions/mv3/match_patterns/
         */
        host_permissions?: string[]
    }

    export interface SupportedSitesDeclare {
        /**
         * opt-in means the listed site is supported.
         * out-out means the listed site is not supported.
         */
        type: 'opt-in' | 'opt-out'
        sites: Partial<Record<EnhanceableSite, boolean>>
    }

    export type I18NLanguage = string
    export type I18NKey = string
    export type I18NValue = string
    export type I18NResource =
        | I18NLanguageResourcePair
        | LinguiI18NResource
        | Array<I18NLanguageResourcePair | LinguiI18NResource>
    export type I18NLanguageResourcePair = Record<I18NLanguage, Record<I18NKey, I18NValue>>
    export type LinguiI18NResource = Record<I18NLanguage, { messages: any }>

    export interface Contribution {
        /** This plugin can recognize and react to the following metadata keys. */
        metadataKeys?: ReadonlySet<string>
        /** This plugin can recognize and enhance the post that matches the following matchers. */
        postContent?: ReadonlySet<RegExp | string>
    }
}

/** This part runs in the Site Adaptor */
export namespace Plugin.SiteAdaptor {
    export interface SiteAdaptorContext extends Shared.SharedUIContext {}

    export type ProfileTabSlot = 'profile-page' | 'search' | 'profile-card'
    export interface Definition extends GeneralUI.Definition, Shared.DefinitionDeferred<SiteAdaptorContext> {
        /** This UI will be rendered for each post found. */
        PostInspector?: InjectUI
        /** This UI will be rendered for action of each post found. */
        PostActions?: InjectUI
        /** This UI will be rendered for each decrypted post. */
        DecryptedInspector?: InjectUI<{
            message: TypedMessage
        }>
        /** This UI will be rendered into the global scope of the site. */
        GlobalInjection?: InjectUI
        /** This UI will be rendered under the Search result of the site */
        SearchResultInspector?: SearchResultInspector
        /** This UI will be rendered under the Search result of the site. */
        SearchResultTabs?: SearchResultTab[]
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
        /**
         * actions ui injected in profile tabs
         * slot is used to distinguish among different slots.
         */
        ProfileTabActions?: ComponentType<{ slot: ProfileTabSlot }>
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
        /** This UI will be rendered components on the Lens realm */
        Lens?: LensWidget
        /** This UI will be rendered components on the Lens realm */
        Farcaster?: FarcasterWidget
        NameWidget?: NameWidget
        /** This UI will be rendered as plugin wrapper page */
        wrapperProps?: PluginWrapperProps
        /**
         * A hook for if this plugin can enhance the #hash or $cash tag.
         */
        enhanceTag?: {
            onClick?: (kind: 'cash' | 'hash', content: string, event: React.MouseEvent<HTMLAnchorElement>) => void
            onHover?: (kind: 'cash' | 'hash', content: string, event: React.MouseEvent<HTMLAnchorElement>) => () => void
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
            onClick?: (walletConnectedCallback?: () => void, requiredSupportPluginID?: NetworkPluginID) => void
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

        hiddenInList?: boolean
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
                resultList: Array<SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
                currentResult: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
                isProfilePage?: boolean
                identity?: SocialIdentity | null
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
                identity?: SocialIdentity | null
                userId?: string
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
                identity?: SocialIdentity | null,
                socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>,
                sourceType?: AvatarRealmSourceType,
            ): boolean
        }
    }

    export enum TipsSlot {
        FollowButton = 'follow',
        Post = 'post',
        Profile = 'profile',
        MirrorMenu = 'mirror-menu',
        MirrorEntry = 'mirror-entry',
        MirrorProfile = 'mirror-profile',
        MirrorVerification = 'mirror-verification',
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

    export enum LensSlot {
        ProfileName = 'profile-name',
        Post = 'post',
        Sidebar = 'sidebar',
    }

    export enum FarcasterSlot {
        ProfileName = 'profile-name',
        Post = 'post',
        Sidebar = 'sidebar',
    }

    export interface LensOptions {
        identity?: ProfileIdentifier
        slot: LensSlot
        accounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
        /** To update enabled/disabled status */
        onStatusUpdate?(disabled: boolean): void
    }
    export interface FarcasterOptions {
        identity?: ProfileIdentifier
        slot: FarcasterSlot
        accounts?: string[][]
        /** To update enabled/disabled status */
        onStatusUpdate?(disabled: boolean): void
    }

    export interface LensWidget {
        ID: string
        UI?: {
            /**
             * The injected Lens Content component
             */
            Content: InjectUI<LensOptions>
        }
    }
    export interface FarcasterWidget {
        ID: string
        UI?: {
            /**
             * The injected Lens Content component
             */
            Content: InjectUI<FarcasterOptions>
        }
    }
    export enum NameWidgetSlot {
        ProfileName = 'profile-name',
        Post = 'post',
        Sidebar = 'sidebar',
    }
    export interface NameWidgetOptions {
        slot: NameWidgetSlot
        userId?: string
        identity?: ProfileIdentifier
        /** To update enabled/disabled status */
        onStatusUpdate?(disabled: boolean): void
    }
    export interface NameWidget {
        ID: string
        UI?: {
            /**
             * The injected Lens Content component
             */
            Content: InjectUI<NameWidgetOptions>
        }
        priority: number
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
        children: InjectUI
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
                identity?: SocialIdentity | null
                socialAccount?: SocialAccount<Web3Helper.ChainIdAll>
            }>
        }
        Utils?: {
            /**
             * If it returns false, this tab will not be displayed.
             */
            shouldDisplay?(
                identity?: SocialIdentity | null,
                socialAccount?: SocialAccount<Web3Helper.ChainIdAll>,
            ): boolean
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

    export interface SettingsTabUIProps {
        onClose: () => void
        bindingWallets?: BindingProof[]
        currentPersona?: ECKeyIdentifier
        pluginID: PluginID
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
            TabContent: InjectUI<SettingsTabUIProps>
        }
    }

    /** Contribute a widget to other plugins. */
    export interface Widget {
        ID: string

        name: keyof WidgetRegistry

        label: I18NStringField | string

        UI?: {
            Widget: InjectUI
        }
    }

    export interface WidgetRegistry {
        example: any
    }
}

/** This part runs in the background page */
export namespace Plugin.Worker {
    export interface WorkerContext extends Shared.SharedContext {
        getDatabaseStorage<T extends IndexableTaggedUnion>(): DatabaseStorage<T>
        /**
         * Start the background service.
         * @param impl Implementation of the RPC
         */
        startService(impl: object): void
        /**
         * Start the background generator service.
         * @param impl Implementation of the RPC
         */
        startGeneratorService(impl: object): void
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
    export interface Definition {
        /** This UI will be injected into the global scope of the target page. */
        GlobalInjection?: InjectUI
        /**
         * Render metadata in many different environments.
         *
         * 1. Environment
         *
         * The render component MUST NOT assume they are running in a specific environment (e.g. Site Adaptor).
         * Plugin messages and RPC MAY NOT working.
         *
         * It MUST NOT assume the environment using the `context` props.
         * ALL actions MUST BE DONE with the given props.
         *
         * Here is some example of *possible* environments.
         * - inside site adaptor, given "composition" context, running in the CompositionDialog.
         * - inside site adaptor, given "post" context,        running in the DecryptedPost.
         * - inside Popups,       given "post" context,        running in the PostInspector (Isolated mode).
         * - on mask.io,          given "post" context,        allowing preview the message without extension installed.
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
        metadataRender?: MetadataRender.StaticRender | MetadataRender.DynamicRender
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
    export type InjectUI<Props = Record<string, never>> = InjectUIRaw<Props> | InjectUIReact<Props>
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

export interface IdentityResolved {
    nickname?: string
    avatar?: string
    bio?: string
    homepage?: string
    identifier?: ProfileIdentifier
    isOwner?: boolean
    profileId?: string
    /** Firefly only */
    lensToken?: string
    /** Firefly only */
    farcasterMessage?: string
    /** Firefly only */
    farcasterSignature?: string
    /** Firefly only */
    farcasterSigner?: string
}

/**
 * This namespace is not related to the plugin authors
 */
// ---------------------------------------------------
export namespace Plugin.__Host {
    export interface Host<Definition, Context> {
        /**
         * Control if the plugin is in the minimal mode.
         *
         * If it is in the minimal mode, it will be omitted in some cases.
         */
        minimalMode: EnabledStatusReporter
        /**
         * Control if the plugin is disabled or not.
         */
        disabled: EnabledStatusReporter

        addI18NResource(pluginID: string, resources: Shared.I18NResource): void

        createContext(id: string, definition: Definition, signal: AbortSignal): Context

        signal?: AbortSignal
        permission: PermissionReporter
    }

    export interface WorkerContext extends Omit<Worker.WorkerContext, 'startService' | 'startGeneratorService'> {}
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
