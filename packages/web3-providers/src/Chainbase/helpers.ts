import urlcat from 'urlcat'
import { EMPTY_LIST } from '@masknet/shared-base'
import { TransactionStatusType, type Transaction } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { CHAINBASE_API_URL } from './constants.js'
import type { Tx, TxStatus } from './types.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'

export async function fetchFromChainbase<T>(pathname: string) {
    const data = await fetchCachedJSON<
        | {
              code: 0 | Omit<number, 0>
              message: 'ok' | Omit<string, 'ok'>
              data: T
          }
        | undefined
    >(urlcat(CHAINBASE_API_URL, pathname))
    return data?.code === 0 ? data.data : undefined
}

export function toTransaction(chainId: ChainId, tx: Tx): Transaction<ChainId, SchemaType> {
    return {
        id: tx.transaction_hash,
        hash: tx.transaction_hash,
        chainId,
        status: normalizeTxStatus(tx.status),
        timestamp: new Date(tx.block_timestamp).getTime(),
        from: tx.from_address,
        to: tx.to_address,
        assets: EMPTY_LIST,
        blockNumber: Number.parseInt(tx.block_number, 10),
        nonce: tx.nonce,
    }
}

/** 0 is fail, 1 is succeed */
export function normalizeTxStatus(status: TxStatus) {
    const map = {
        0: TransactionStatusType.FAILED,
        1: TransactionStatusType.SUCCEED,
    }
    return map[status]
}
