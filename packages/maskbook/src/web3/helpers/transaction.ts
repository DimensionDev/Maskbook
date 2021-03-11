import type { TransactionResponse } from '@ethersproject/abstract-provider'
import Services from '../../extension/service'
import { delay } from '../../utils/utils'
import { Stage, StageType } from '../types'

/**
 * Polling transaction response and emit progress events manually
 * @param address
 * @param response
 */
export async function* watchTransaction(
    address: string,
    response: TransactionResponse,
): AsyncIterator<Stage, void, unknown> & {
    [Symbol.asyncIterator](): AsyncIterator<Stage, void, unknown>
} {
    // add emit method
    const { hash } = response

    // transaction hash
    yield {
        type: StageType.TRANSACTION_HASH,
        hash,
    }

    try {
        for (const _ of new Array(30).fill(0)) {
            const receipt = await Services.Ethereum.getTransactionReceipt(
                hash,
                await Services.Ethereum.getChainId(address),
            )

            if (!receipt) {
                await delay(15 /* seconds */ * 1000 /* milliseconds */)
                continue
            }

            // transaction receipt created
            if (receipt) {
                yield {
                    type: StageType.RECEIPT,
                    receipt,
                }
            }

            // transation was mined
            if (receipt.blockNumber) {
                yield {
                    type: StageType.CONFIRMATION,
                    no: receipt.confirmations,
                    receipt,
                }
                return
            }

            // transation receipt
            yield {
                type: StageType.RECEIPT,
                receipt,
            }
        }
    } catch (error) {
        // error: failed to get transaction receipt
        yield {
            type: StageType.ERROR,
            error,
        }
    }

    // error: timeout
    yield {
        type: StageType.ERROR,
        error: new Error('Read transaction receipt timeout.'),
    }
}
