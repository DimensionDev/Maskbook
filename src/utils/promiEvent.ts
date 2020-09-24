import { EventIterator } from 'event-iterator'
import PromiEvent from 'promievent'
import type { PromiEvent as PromiEventW3, TransactionReceipt } from 'web3-core'

export enum StageType {
    TRANSACTION_HASH = 0,
    RECEIPT,
    CONFIRMATION,
}

export type Stage =
    | {
          type: StageType.TRANSACTION_HASH
          hash: string
      }
    | {
          type: StageType.RECEIPT
          receipt: TransactionReceipt
      }
    | {
          type: StageType.CONFIRMATION
          no: number
          receipt: TransactionReceipt
      }

/**
 * Convert PromiEvent to iterator
 * the full list of events were supported by web3js
 * https://web3js.readthedocs.io/en/v1.2.7/callbacks-promises-events.html
 * @param ev the promise event object
 * @param finishStage the iterator will be stopped at given stage
 */
export function promiEventToIterator<T>(ev: PromiEventW3<T>, finishStage: StageType = StageType.CONFIRMATION) {
    return new EventIterator<Stage>(function (queue) {
        const stopIfNeeded = (currentStage: StageType) => {
            if (currentStage >= finishStage) queue.stop()
        }
        ev.on('transactionHash', (hash: string) => {
            queue.push({
                type: StageType.TRANSACTION_HASH,
                hash,
            })
            stopIfNeeded(StageType.TRANSACTION_HASH)
        })
        ev.on('receipt', (receipt: TransactionReceipt) => {
            queue.push({
                type: StageType.RECEIPT,
                receipt,
            })
            stopIfNeeded(StageType.RECEIPT)
        })
        ev.on('confirmation', (no: number, receipt: TransactionReceipt) => {
            queue.push({
                type: StageType.CONFIRMATION,
                no,
                receipt,
            })
            stopIfNeeded(StageType.CONFIRMATION)
        })
        ev.on('error', queue.fail)
    })
}

/**
 * Convert interator to PromiEvent
 * @param iterator
 */
export function iteratorToPromiEvent(
    iterator: AsyncIterator<Stage, void, unknown> & {
        [Symbol.asyncIterator](): AsyncIterator<Stage, void, unknown>
    },
) {
    let resolve_: Function | undefined = undefined
    let reject_: Function | undefined = undefined
    const PE = new PromiEvent<TransactionReceipt>(async (resolve, reject) => {
        resolve_ = resolve
        reject_ = reject
    })
    async function execute() {
        try {
            for await (const stage of iterator) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        PE.emit('transactionHash', stage.hash)
                        break
                    case StageType.RECEIPT:
                        PE.emit('receipt', stage.receipt)
                        resolve_?.(stage.receipt)
                        break
                    case StageType.CONFIRMATION:
                        PE.emit('confirmation', stage.no, stage.receipt)
                        break
                    default:
                        // skip unknown stage
                        console.log('DEBUG: unknown stage')
                        console.log(stage)
                        break
                }
            }
        } catch (e) {
            PE.emit('error', e)
            reject_?.(e)
        }
    }
    execute()
    return PE
}
