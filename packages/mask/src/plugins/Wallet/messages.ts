import { createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER, WalletMessages } from '@masknet/plugin-wallet'
import type { _AsyncVersionOf } from 'async-call-rpc'

export { WalletMessages } from '@masknet/plugin-wallet'
export type { SelectTokenDialogEvent, SelectNftContractDialogEvent } from '@masknet/plugin-wallet'
export const WalletRPC: _AsyncVersionOf<typeof import('./services')> = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services') as any,
    WalletMessages.events.rpc,
)
