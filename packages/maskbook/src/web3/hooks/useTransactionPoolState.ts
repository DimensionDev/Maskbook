import type { ERC20TokenDetailed, ERC721TokenDetailed, EtherTokenDetailed } from '../types'
import type { TransactionState } from './useTransactionState'

export interface TransactionPoolState {
    tokens: Record<string, EtherTokenDetailed | ERC20TokenDetailed | ERC721TokenDetailed>
    listOfTransactionState: TransactionState[]
}

export enum TrasnactionPoolActionType {
    ADD_TOKEN,
    DELETE_TOKEN,
    UPDATE_TOKEN,

    UPDATE_TOKEN_AMOUNT,
    UPDATE_TOKEN_BALANCE,
    UPDATE_TOKEN_ALLOWANCE,
    UPDATE_TOKEN_DETAILED,

    UNLOCK_ERC20_TOKEN,
    SELECT_ERC20_TOKEN,

    SELECT_WALLET,
    SELECT_NETWORK,
    SELECT_PROVIDER,
}

export type TransactionPoolAction =
    | {
          type: TrasnactionPoolActionType.ADD_TOKEN
          id: string
          token: EtherTokenDetailed | ERC20TokenDetailed | ERC721TokenDetailed
      }
    | {
          type: TrasnactionPoolActionType.DELETE_TOKEN
          id: string
      }
    | {
          type: TrasnactionPoolActionType.UPDATE_TOKEN
          id: string
          token: Partial<EtherTokenDetailed | ERC20TokenDetailed | ERC721TokenDetailed>
      }
    | {
          type: TrasnactionPoolActionType.UPDATE_TOKEN_BALANCE
          id: string
      }
    | {
          type: TrasnactionPoolActionType.UPDATE_TOKEN_ALLOWANCE
          id: string
          recipent: string
      }
    | {
          type: TrasnactionPoolActionType.UPDATE_TOKEN_AMOUNT
          id: string
          amount: string
      }
    | {
          type: TrasnactionPoolActionType.UNLOCK_ERC20_TOKEN
          id: string
          amount: string
          recipent: string
      }

export function useTransactionPoolState() {}
