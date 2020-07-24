import type { TypedMessage } from '../extension/background-script/CryptoServices/utils'

type PluginInjectFunction<T> =
    | {
          type: 'raw'
          init: (post: PostInfo, props: T, mountingPoint: HTMLDivElement) => () => void
      }
    | React.ComponentType<T>

export interface PluginConfig {
    pluginName: string
    identifier: string
    successDecryptionInspector?: PluginInjectFunction<{ message: TypedMessage }>
    postInspector?: PluginInjectFunction<{}>
    postDialogMetadataBadge?: Map<string, (metadata: any) => string>
}

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { GitcoinPluginDefine } from './Gitcoin/define'
import { RedPacketPluginDefine } from './Wallet/define'
import { PollsPluginDefine } from './Polls/define'
import type { PostInfo } from '../social-network/PostInfo'
import { StorybookPluginDefine } from './Storybook/define'
plugins.add(GitcoinPluginDefine)
plugins.add(RedPacketPluginDefine)
plugins.add(PollsPluginDefine)
if (process.env.STORYBOOK) {
    plugins.add(StorybookPluginDefine)
}
