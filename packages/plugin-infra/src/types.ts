import type { TypedMessage, TypedMessageTuple } from '@masknet/shared'
import type { Emitter } from '@servie/events'
import type { Option, Result } from 'ts-results'

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
     *     hotModuleReload: hot => import.meta.webpackHot?.accept('./code', () => hot(import('./code')))
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
         * @example hotModuleReload: hot => import.meta.webpackHot?.accept('./path', () => hot(import('./path')))
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
    }
    /**
     * This part is shared between Dashboard, SNSAdaptor and Worker part
     * which you should include the information above in those three parts.
     */
    export interface DefinitionWithInit extends Definition {
        /**
         * This function is called when the plugin is initialized.
         *
         * The plugin must clean up all side effects it creates when the `AbortSignal` provided aborts
         * to make sure the plugin can be reloaded safely.
         */
        init(signal: AbortSignal): void | Promise<void>
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
        /** This flag indicates the plugin entry in the composition entry should be hidden if the current chain is invalid. */
        compositionEntryRequiresChainIDValid?: boolean
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
}

/** This part runs in the SNSAdaptor */
export namespace Plugin.SNSAdaptor {
    export interface Definition extends Shared.DefinitionWithInit {
        /** This UI will be rendered for each post found. */
        PostInspector?: InjectUI<{}>
        /** This UI will be rendered for each decrypted post. */
        DecryptedInspector?: InjectUI<{ message: TypedMessage }>
        /** This UI will be rendered under the Search box of the SNS. */
        SearchBoxComponent?: InjectUI<{}>
        /** This UI will be rendered into the global scope of an SNS. */
        GlobalInjection?: InjectUI<{}>
        /** This UI will be an entry to the plugin in the Composition dialog of Mask. */
        CompositionDialogEntry?: CompositionDialogEntry
        /** This UI will be use when there is known badges. */
        CompositionDialogMetadataBadgeRender?: CompositionMetadataBadgeRender
    }
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
        label: I18NStringField | React.ReactNode
        /** This callback will be called when the user clicked on the chip. */
        onClick(): void
    }
    export interface CompositionDialogEntryDialog {
        /**
         * A label that will be rendered in the CompositionDialog as a chip.
         * @example {fallback: "🧧 Red Packet"}
         */
        label: I18NStringField | React.ReactNode
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
}

/** This part runs in the dashboard */
export namespace Plugin.Dashboard {
    // As you can see we currently don't have so much use case for an API here.
    export interface Definition extends Shared.DefinitionWithInit {
        /** This UI will be injected into the global scope of the Dashboard. */
        GlobalInjection?: InjectUI<{}>
    }
}

/** This part runs in the background page */
export namespace Plugin.Worker {
    export interface Definition extends Shared.DefinitionWithInit {
        /** TODO: this functionality has not be done yet. */
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
// TODO: Plugin i18n is not read today.
// TODO: Add an entry for i18n JSON files, and provide hooks.
export interface I18NStringField {
    /** The i18n key of the string content. */
    i18nKey?: string
    /** The fallback content to display if there is no i18n string found. */
    fallback: string
}

/**
 * The current running SocialNetwork.
 */
export enum CurrentSNSNetwork {
    Unknown = 0,
    Facebook,
    Twitter,
    Instagram,
}

/**
 * This namespace is not related to the plugin authors
 */
// ---------------------------------------------------
export namespace Plugin.__Host {
    export interface Host {
        enabled: EnabledStatusReporter
        signal?: AbortSignal
    }
    export interface EnabledStatusReporter {
        isEnabled(id: string): boolean | Promise<boolean>
        events: Emitter<{ enabled: [id: string]; disabled: [id: string] }>
    }
}
