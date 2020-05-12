import type { TypedMessage } from '../extension/background-script/CryptoServices/utils'

export interface PluginConfig {
    identifier: string
    shouldActivateInPostInspector(post: string): boolean
    shouldActivateInSuccessDecryption(post: TypedMessage): boolean
    PostInspectorComponent: React.ComponentType<{ post: string }>
    SuccessDecryptionComponent: React.ComponentType<{ post: TypedMessage }>
}

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { GitCoinConfig } from './Gitcoin/define'
plugins.add(GitCoinConfig)
