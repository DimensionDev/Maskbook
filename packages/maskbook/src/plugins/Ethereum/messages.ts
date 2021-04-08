import type { FixedTokenListProps } from '../../extension/options-page/DashboardComponents/FixedTokenList'
import type { TransactionState } from '../../web3/hooks/useTransactionState'
import type { ERC20TokenDetailed, EthereumTokenType, TokenDetailedType } from '../../web3/types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

export type SelectTokenDialogEvent =
    | {
          open: true
          uuid: string
          type: EthereumTokenType
          disableEther?: boolean
          disableSearchBar?: boolean
          FixedTokenListProps?: Omit<FixedTokenListProps, 'type' | 'onSubmit'>
      }
    | {
          open: false
          uuid: string

          /**
           * The selected detailed token.
           */
          token?: TokenDetailedType<EthereumTokenType>
      }

export type UnlockERC20TokenDialogEvent =
    | {
          open: true
          token: ERC20TokenDetailed
          amount: string
          spender: string
      }
    | {
          open: false
      }

export type TransactionDialogEvent =
    | {
          open: true
          state: TransactionState
          shareLink?: string
          summary?: string
      }
    | {
          open: false
      }

export type ConfirmSwapDialogEvent =
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
     * Select token dialog
     */
    selectTokenDialogUpdated: SelectTokenDialogEvent

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
