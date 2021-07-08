import type { TypedMessage } from '../protocols/typed-message'
import type { PostInfo } from '../social-network/PostInfo'

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

export type BadgeConvertor<T = any> = (metadata: T) => string | React.ReactNode

export interface PluginConfig {
    id: string
    pluginIcon: React.ReactNode
    pluginName: string
    pluginDescription: string
    identifier: string
    stage: PluginStage
    scope: PluginScope
    successDecryptionInspector?: PluginInjectFunction<{ message: TypedMessage }>
    postInspector?: PluginInjectFunction<{}>
    SearchBoxComponent?: React.ComponentType<{}>
    PageComponent?: React.ComponentType<{}>
    DashboardComponent?: React.ComponentType<{}>
    postDialogMetadataBadge?: Map<string, BadgeConvertor>
    postDialogEntries?: PostDialogEntry[]
}
