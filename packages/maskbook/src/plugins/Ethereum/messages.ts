import type { TransactionState } from '../../web3/hooks/useTransactionState'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../web3/types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

type SelectTokenDialogEvent =
    | {
          open: true
          address?: string
          lists?: string[]
          excludeTokens?: string[]
      }
    | {
          open: false
          token?: EtherTokenDetailed | ERC20TokenDetailed
      }

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
      }
    | {
          open: false
      }

type ConfirmSwapDialogEvent =
    | {
          open: true
          variableIndex: 1 | 2 | 3 | 'bypass'
      }
    | {
          open: false
          result: boolean
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

    /**
     * Confirm Swap
     */
    confirmSwapDialogUpdated: ConfirmSwapDialogEvent

    rpc: unknown
}

export const EthereumMessages = createPluginMessage<EthereumMessage>(PLUGIN_IDENTIFIER)
export const EthereumRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), EthereumMessages.events.rpc)
