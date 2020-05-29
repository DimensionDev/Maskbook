import type { TypedMessage } from '../extension/background-script/CryptoServices/utils'
import type { PostIdentifier, ProfileIdentifier } from '../database/type'

export interface PluginSuccessDecryptionComponentProps {
    message: TypedMessage
    postIdentifier: PostIdentifier<ProfileIdentifier> | undefined
}

export interface PluginConfig {
    identifier: string
    shouldActivateInPostInspector(post: string): boolean
    shouldActivateInSuccessDecryption(post: TypedMessage): boolean
    PostInspectorComponent: React.ComponentType<{ post: string }>
    SuccessDecryptionComponent: React.ComponentType<PluginSuccessDecryptionComponentProps>
}

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { GitCoinConfig } from './Gitcoin/define'
import { RedPacketPluginDefine } from './Wallet/define'
plugins.add(GitCoinConfig)
plugins.add(RedPacketPluginDefine)
