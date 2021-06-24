import { EventIterator } from 'event-iterator'
import PromiEvent from 'promievent'
import type { PromiEvent as PromiEventW3, TransactionReceipt } from 'web3-core'
import { TransactionEventType } from '@masknet/web3-shared'

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
 * The original Web3 PromiEvent hasn't got `emit` method
 * @param ev
 */
export function enhancePromiEvent(ev: PromiEventW3<TransactionReceipt | string>) {
    let resolve_: Function | undefined = undefined
    let reject_: Function | undefined = undefined
    const PE = new PromiEvent<TransactionReceipt>(async (resolve, reject) => {
        resolve_ = resolve
        reject_ = reject
    })

    // event emitter
    ev.on(TransactionEventType.TRANSACTION_HASH, (hash) => PE.emit(TransactionEventType.TRANSACTION_HASH, hash))
    ev.on(TransactionEventType.RECEIPT, (receipt) => {
        PE.emit(TransactionEventType.RECEIPT, receipt)
        resolve_?.(receipt)
    })
    ev.on(TransactionEventType.CONFIRMATION, (no, receipt) => {
        PE.emit(TransactionEventType.CONFIRMATION, no, receipt)
        resolve_?.(receipt)
    })
    ev.on(TransactionEventType.ERROR, (error) => {
        PE.emit(TransactionEventType.ERROR, error)
        reject_?.(error)
    })

    // promise
    ev.then(resolve_)
    ev.catch(reject_)
    return PE
}

/**
 * Convert PromiEvent to iterator
 * the full list of events were supported by web3js
 * https://web3js.readthedocs.io/en/v1.2.7/callbacks-promises-events.html
 * @param ev the promise event object
 * @param finishStage the iterator will be stopped at given stage
 */
export function promiEventToIterator<T extends string | TransactionReceipt>(
    ev: PromiEvent<T>,
    finishStage: StageType = StageType.CONFIRMATION,
) {
    return new EventIterator<Stage>(function (queue) {
        const stopIfNeeded = (currentStage: StageType) => {
            if (currentStage >= finishStage) queue.stop()
        }

        // event emitter
        ev.on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
            queue.push({
                type: StageType.TRANSACTION_HASH,
                hash,
            })
            stopIfNeeded(StageType.TRANSACTION_HASH)
        })
        ev.on(TransactionEventType.RECEIPT, (receipt) => {
            queue.push({
                type: StageType.RECEIPT,
                receipt,
            })
            stopIfNeeded(StageType.RECEIPT)
        })
        ev.on(TransactionEventType.CONFIRMATION, (no, receipt) => {
            queue.push({
                type: StageType.CONFIRMATION,
                no,
                receipt,
            })
            stopIfNeeded(StageType.CONFIRMATION)
        })
        ev.on(TransactionEventType.ERROR, queue.fail)

        // promise
        ev.then((hashOrReceipt: T) => {
            if (typeof hashOrReceipt === 'string') {
                queue.push({
                    type: StageType.TRANSACTION_HASH,
                    hash: hashOrReceipt,
                })
                stopIfNeeded(StageType.TRANSACTION_HASH)
            } else {
                queue.push({
                    type: StageType.RECEIPT,
                    receipt: hashOrReceipt as TransactionReceipt,
                })
                stopIfNeeded(StageType.RECEIPT)
            }
        })
        ev.catch(queue.fail)
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
    processor: (stage: Stage) => Stage,
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
                const stage_ = processor(stage)
                switch (stage_.type) {
                    case StageType.TRANSACTION_HASH:
                        PE.emit(TransactionEventType.TRANSACTION_HASH, stage_.hash)
                        break
                    case StageType.RECEIPT:
                        PE.emit(TransactionEventType.RECEIPT, stage_.receipt)
                        resolve_?.(stage_.receipt)
                        break
                    case StageType.CONFIRMATION:
                        PE.emit(TransactionEventType.CONFIRMATION, stage_.no, stage_.receipt)
                        break
                    default:
                        break
                }
            }
        } catch (e) {
            PE.emit(TransactionEventType.ERROR, e)
            reject_?.(e)
        }
    }
    execute()
    return PE
}
