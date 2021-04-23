import type { TypedMessage } from '../protocols/typed-message'
import type { SupportedNetworks } from '../social-network-adaptor'
import type { PostInfo } from '../social-network/PostInfo'
import type { ChainId } from '../web3/types'

// Don't define values in namespaces
export namespace Plugin {
    export namespace Config {
        export interface Definition {
            /**
             * (Not human readable) ID of the plugin
             * @example "com.mask.wallet"
             */
            ID: string
            /** The human readable name of the plugin */
            name: I18NStringField
            /** Publisher */
            publisher?: Publisher
            /** In what condition this plugin will be enabled */
            enableRequirement: EnableRequirement
        }
        export interface Publisher {
            name: I18NStringField
            link: string
        }
        export type ReleaseStages = 'stable' | 'beta' | 'insider'
        export interface EnableRequirement {
            target: ReleaseStages
            architecture: Record<'app' | 'web', boolean>
            networks: Record<SupportedNetworks, boolean>
            /**
             * undefined: The plugin manager will not take care of this plugin when the eth network changes
             * @default undefined
             */
            eth?: Partial<Record<ChainId, boolean>>
        }
    }

    export namespace UI {
        export interface Definition extends Config.Definition {
            init(signal: AbortSignal): void | Promise<void>
            snsAdaptor: SNSAdaptorInjection.Definition
            dashboard: DashboardInjection.Definition
            typedMessagePipeline: TypedMessagePipeline
        }
        export namespace DashboardInjection {
            export interface Definition {
                /** This hook will inject things in to the global scope of the Dashboard. */
                GlobalInjection?: InjectHook<{}>
            }
        }
        export namespace SNSAdaptorInjection {
            export interface Definition {
                /** This hook will be called if there is a new post found. */
                PostInspector?: InjectHook<{ post: PostInfo }>
                /** This hook will be called if there is a new decrypted post appears. */
                DecryptedInspector?: InjectHook<{ message: TypedMessage }>
                SearchBoxComponent?: InjectHook<{}>
                /** This hook will inject things in to the global scope of an SNS. */
                GlobalInjection?: InjectHook<{}>
                /** This hook will inject things in to the global scope of the dashboard. */
                PostDialogEntry?: PostDialogEntry
            }
            export type PostDialogEntry = PostDialogEntry_Custom | CompositionDialogEntry_Dialog
            export interface PostDialogEntry_Custom {
                label: I18NStringField | React.ReactNode
                onClick(): void
            }
            export interface CompositionDialogEntry_Dialog {
                label: I18NStringField | React.ReactNode
                dialog: React.ComponentType<CompositionDialogEntry_DialogProps>
            }
            export type CompositionDialogEntry_DialogProps = {
                open: boolean
                onClose(): void
            }
        }
        export type TypedMessagePipeline = (message: TypedMessage) => TypedMessage
        export type InjectHook<Props> = RawInjectHook<Props> | ReactInjectHook<Props>
        export type RawInjectHook<Props> = {
            type: 'raw'
            init(signal: AbortSignal, post: PostInfo, mountingPoint: HTMLDivElement): (props: Props) => void
        }
        export type ReactInjectHook<Props> = React.ComponentType<Props>
    }
    export namespace Worker {
        export interface Definition {
            init(signal: AbortSignal): void
        }
    }
    export interface DeferredDefinition extends Config.Definition {
        /**
         * Do not make side effects. It should happen in `.init()`
         * @returns the completion definition of this plugin
         * @example load: () => import('./full-definition')
         */
        load_ui(): Promise<{ default: UI.Definition }>
        /**
         * Do not make side effects. It should happen in `.init()`
         * @returns the completion definition of this plugin
         * @example load: () => import('./full-definition')
         */
        load_worker?(): Promise<{ default: Worker.Definition }>
        /**
         * On Hot Module Reload. When call the callback, it will unload the current instance and load the new one.
         */
        hotModuleReload_ui?(onHot: (hot: UI.Definition) => void): void
        /**
         * On Hot Module Reload. When call the callback, it will unload the current instance and load the new one.
         */
        hotModuleReload_worker?(onHot: (hot: Worker.Definition) => void): void
    }
}
export interface I18NStringField {
    i18nKey?: string
    fallback: string
}
