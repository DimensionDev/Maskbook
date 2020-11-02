import type { TypedMessage, TypedMessageCompound } from '../protocols/typed-message'
import type { PostInfo } from '../social-network/PostInfo'

type PluginInjectFunction<T> =
    | {
          type: 'raw'
          init: (post: PostInfo, props: T, mountingPoint: HTMLDivElement) => () => void
      }
    | React.ComponentType<T>

export const enum PluginStage {
    Development,
    Internal,
    Beta,
    Production,
}

export interface PluginConfig {
    pluginName: string
    identifier: string
    stage: PluginStage
    successDecryptionInspector?: PluginInjectFunction<{ message: TypedMessage }>
    postInspector?: PluginInjectFunction<{}>
    PageComponent?: React.ComponentType<{}>
    DashboardComponent?: React.ComponentType<{}>
    postDialogMetadataBadge?: Map<string, (metadata: any) => string>
    postDialogEntries?: {
        label: string | React.ReactNode
        onClick(): void
    }[]
    messageProcessor?: (message: TypedMessageCompound) => TypedMessageCompound
}

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { WalletPluginDefine } from './Wallet/define'
import { GitcoinPluginDefine } from './Gitcoin/define'
import { RedPacketPluginDefine } from './RedPacket/define'
import { PollsPluginDefine } from './Polls/define'
import { StorybookPluginDefine } from './Storybook/define'
import { FileServicePluginDefine } from './FileService/define'
import { TraderPluginDefine } from './Trader/define'
import { Flags } from '../utils/flags'
import { TransakPluginDefine } from './Transak/define'
plugins.add(WalletPluginDefine)
plugins.add(GitcoinPluginDefine)
plugins.add(RedPacketPluginDefine)
plugins.add(FileServicePluginDefine)
if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
if (Flags.trader_enabled) plugins.add(TraderPluginDefine)
if (Flags.transak_enabled) plugins.add(TransakPluginDefine)
if (process.env.STORYBOOK) plugins.add(StorybookPluginDefine)
