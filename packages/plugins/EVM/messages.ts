import { createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER, WalletMessages } from '@masknet/plugin-wallet'

export { WalletMessages } from '@masknet/plugin-wallet'
export type { SelectTokenDialogEvent, SelectNftContractDialogEvent } from '@masknet/plugin-wallet'

export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.events.rpc)
