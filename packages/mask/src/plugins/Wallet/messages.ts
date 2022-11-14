import { createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID, WalletMessages } from '@masknet/plugin-wallet'
import type { AsyncVersionOf } from 'async-call-rpc'

export { WalletMessages } from '@masknet/plugin-wallet'
export type { SelectNftContractDialogEvent } from '@masknet/plugin-wallet'
export const WalletRPC: AsyncVersionOf<typeof import('./services/index.js')> = createPluginRPC(
    PLUGIN_ID,
    () => import('./services/index.js') as any,
    WalletMessages.events.rpc,
)
