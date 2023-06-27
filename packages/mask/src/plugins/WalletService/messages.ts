import type { AsyncVersionOf } from 'async-call-rpc'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

const WalletServiceMessages = createPluginMessage(PLUGIN_ID)
export const WalletRPC: AsyncVersionOf<typeof import('./services/index.js')> = createPluginRPC(
    PLUGIN_ID,
    () => import('./services/index.js') as any,
    WalletServiceMessages.rpc,
)
