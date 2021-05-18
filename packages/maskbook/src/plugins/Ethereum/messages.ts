import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { TransactionState } from '../../web3/hooks/useTransactionState'
import type { ERC20TokenDetailed } from '../../web3/types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

type UnlockERC20TokenDialogEvent =
    | {
          open: true
          token: ERC20TokenDetailed
          amount: string
          spender: string
      }
    | {
          open: false
      }

type TransactionDialogEvent =
    | {
          open: true
          state: TransactionState
          shareLink?: string
          summary?: string
          title?: string
      }
    | {
          open: false
      }

interface EthereumMessage {
    /**
     * Unlock token dialog
     */
    unlockERC20TokenDialogUpdated: UnlockERC20TokenDialogEvent

    /**
     * Transaction dialog
     */
    transactionDialogUpdated: TransactionDialogEvent

    rpc: unknown
}

export const EthereumMessages: WebExtensionMessage<EthereumMessage> =
    createPluginMessage<EthereumMessage>(PLUGIN_IDENTIFIER)
export const EthereumRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), EthereumMessages.events.rpc)
