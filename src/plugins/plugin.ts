import type { TypedMessage } from '../extension/background-script/CryptoServices/utils'
import type { PostIdentifier, ProfileIdentifier } from '../database/type'

export interface PluginSuccessDecryptionComponentProps {
    message: TypedMessage
    postIdentifier: PostIdentifier<ProfileIdentifier> | undefined
}

export interface PluginConfig {
    identifier: string
    // TODO: switch shouldActivateInSuccessDecryption to postInspector style API  @Jack-Works
    shouldActivateInSuccessDecryption(post: TypedMessage): boolean // | Promise<boolean>
    SuccessDecryptionComponent: React.ComponentType<PluginSuccessDecryptionComponentProps>
    postInspector?:
        | {
              type: 'raw'
              init: (post: PostInfo, mountingPoint: HTMLDivElement) => () => void
          }
        | React.ComponentType<PostInfo>
}

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { GitcoinPluginDefine } from './Gitcoin/define'
import { RedPacketPluginDefine } from './Wallet/define'
import type { PostInfo } from '../social-network/ui'
plugins.add(GitcoinPluginDefine)
plugins.add(RedPacketPluginDefine)
