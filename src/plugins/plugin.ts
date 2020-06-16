import type { TypedMessage } from '../extension/background-script/CryptoServices/utils'

type PluginInjectFunction<T> =
    | {
          type: 'raw'
          init: (post: PostInfo, props: T, mountingPoint: HTMLDivElement) => () => void
      }
    | React.ComponentType<T>

export interface PluginConfig {
    identifier: string
    successDecryptionInspector?: PluginInjectFunction<{ message: TypedMessage }>
    postInspector?: PluginInjectFunction<{}>
}

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { GitcoinPluginDefine } from './Gitcoin/define'
import { RedPacketPluginDefine } from './Wallet/define'
import type { PostInfo } from '../social-network/PostInfo'
plugins.add(GitcoinPluginDefine)
plugins.add(RedPacketPluginDefine)
