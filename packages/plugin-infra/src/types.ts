// Don't define values in namespaces
import type { TypedMessage, ChainId } from '@dimensiondev/maskbook-shared'
import type { Emitter } from '@servie/events'
export enum CurrentSNSNetwork {
    Unknown = 0,
    Facebook,
    Twitter,
    Instagram,
}
// Main definition
export namespace Plugin {
    export interface Loader<T> {
        /**
         * Do not make side effects. It should happen in `.init()`
         * @returns the completion definition of this plugin
         * @example load: () => import('./path')
         */
        load(): Promise<{ default: T }>
        /**
         * On Hot Module Reload. When call the callback, it will unload the current instance and load the new one.
         */
        hotModuleReload(onHot: (hot: Promise<{ default: T }>) => void): void
    }
    export interface DeferredDefinition extends Shared.Definition {
        SNSAdaptor?: Loader<SNSAdaptor.Definition>
        Dashboard?: Loader<Dashboard.Definition>
        Worker?: Loader<Worker.Definition>
    }
}
// Shared basic information e.g. name, description, ...
export namespace Plugin.Shared {
    export interface Definition {
        /**
         * (Not human readable) ID of the plugin
         * @example "com.mask.wallet"
         */
        ID: string
        /** The human readable name of the plugin */
        name: I18NStringField
        /** Emoji icon of this plugin */
        icon?: string
        /** Description of this plugin */
        description?: I18NStringField
        /** Publisher */
        publisher?: Publisher
        /** In what condition this plugin will be enabled */
        enableRequirement: EnableRequirement
    }
    export interface DefinitionWithInit extends Definition {
        init(signal: AbortSignal): void | Promise<void>
    }
    export interface Publisher {
        name: I18NStringField
        link: string
    }
    export type ReleaseStages = 'stable' | 'beta' | 'insider'
    export interface EnableRequirement {
        target: ReleaseStages
        architecture: Record<'app' | 'web', boolean>
        networks: SupportedNetworksDeclare
        /**
         * undefined: The plugin manager will not take care of this plugin when the eth network changes
         * @default undefined
         */
        eth?: SupportedChainsDeclare
    }
    export interface SupportedNetworksDeclare {
        /**
         * opt-in means the listed networks is supported.
         * out-out means the listed networks is not supported.
         */
        type: 'opt-in' | 'opt-out'
        networks: Partial<Record<CurrentSNSNetwork, boolean>>
    }
    export interface SupportedChainsDeclare {
        /**
         * opt-in means the listed chains is supported.
         * out-out means the listed chains is not supported.
         */
        type: 'opt-in' | 'opt-out'
        chains: Partial<Record<ChainId, boolean>>
    }
}
// Shared functions
export namespace Plugin.Utils {
    export interface Definition {
        typedMessagePipeline: TypedMessagePipeline
    }
    export type TypedMessagePipeline = (message: TypedMessage) => TypedMessage
}
// Run in content scripts
export namespace Plugin.SNSAdaptor {
    export interface Definition extends Shared.DefinitionWithInit {
        /** This hook will be called if there is a new post found. */
        PostInspector?: InjectUI<{}>
        /** This hook will be called if there is a new decrypted post appears. */
        DecryptedInspector?: InjectUI<{ message: TypedMessage }>
        SearchBoxComponent?: InjectUI<{}>
        /** This hook will inject things in to the global scope of an SNS. */
        GlobalInjection?: InjectUI<{}>
        /** This hook will inject things in to the composition dialog of Mask. */
        CompositionDialogEntry?: CompositionDialogEntry
    }
    export type CompositionDialogEntry = CompositionDialogEntryCustom | CompositionDialogEntryDialog
    export interface CompositionDialogEntryCustom {
        label: I18NStringField | React.ReactNode
        onClick(): void
    }
    export interface CompositionDialogEntryDialog {
        label: I18NStringField | React.ReactNode
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
}
// Run in dashboard
export namespace Plugin.Dashboard {
    export interface Definition extends Shared.DefinitionWithInit {
        /** This hook will inject things in to the global scope of the Dashboard. */
        GlobalInjection?: InjectUI<{}>
    }
}
// Run in background page
export namespace Plugin.Worker {
    export interface Definition extends Shared.DefinitionWithInit {}
}
// Helper types
export namespace Plugin {
    export type InjectUI<Props> = InjectUIRaw<Props> | InjectUIReact<Props>
    export type InjectUIRaw<Props> = {
        type: 'raw'
        init(signal: AbortSignal, mountingPoint: HTMLDivElement): (props: Props) => void
    }
    export type InjectUIReact<Props> = React.ComponentType<Props>
}

export interface I18NStringField {
    i18nKey?: string
    fallback: string
}
export interface PluginHost {
    eth: EthStatusReporter
    enabled: EnabledStatusReporter
    signal?: AbortSignal
}
export interface EthStatusReporter {
    current(): ChainId
    events: Emitter<{ change: [] }>
}
export interface EnabledStatusReporter {
    isEnabled(id: string): boolean
    events: Emitter<{ enabled: [id: string]; disabled: [id: string] }>
}
