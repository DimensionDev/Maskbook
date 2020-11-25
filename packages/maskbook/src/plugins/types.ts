import type { TypedMessage, TypedMessageCompound } from '../protocols/typed-message'
import type { PostInfo } from '../social-network/PostInfo'
import type { TranslationBundle } from '../utils/i18n-next'

type PluginInjectFunction<T> =
    | {
          type: 'raw'
          init: (post: PostInfo, props: T, mountingPoint: HTMLDivElement) => () => void
      }
    | React.ComponentType<T>

export enum PluginStage {
    Development,
    Beta,
    Production,
}

export enum PluginScope {
    Internal,
    Public,
}

export interface PostDialogEntry {
    label: string | React.ReactNode
    onClick(): void
}

export type BadgeConvertor<T = any> = (metadata: T) => string

export type MessageProcessor = (message: TypedMessageCompound) => TypedMessageCompound

export interface PluginConfig {
    pluginName: string
    identifier: string
    stage: PluginStage
    scope: PluginScope
    i18n?: (
        onHMR: (newBundle: Promise<TranslationBundle> | TranslationBundle) => void,
    ) => Promise<TranslationBundle> | TranslationBundle
    successDecryptionInspector?: PluginInjectFunction<{ message: TypedMessage }>
    postInspector?: PluginInjectFunction<{}>
    PageComponent?: React.ComponentType<{}>
    DashboardComponent?: React.ComponentType<{}>
    postDialogMetadataBadge?: Map<string, BadgeConvertor>
    postDialogEntries?: PostDialogEntry[]
    messageProcessor?: MessageProcessor
}
