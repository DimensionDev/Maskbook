import type { Transaction } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { unreachable } from '@dimensiondev/kit'
import { WalletMessages } from '@masknet/plugin-wallet'
import { TransactionState, TransactionStateType } from '@masknet/web3-shared-evm'
import * as helpers from './helpers'

export interface TransactionProgress {
    state: TransactionState
    payload: JsonRpcPayload
}

const watched: Map<string, TransactionProgress> = new Map()

export function addProgress({ state, payload }: TransactionProgress) {
    const progressId = helpers.getPayloadId(payload)
    if (!progressId) return
    if (watched.has(progressId)) return

    watched.set(progressId, {
        payload,
        state,
    })
    updateProgressState(progressId, state)
}

export function removeProgress(progressId: string) {
    watched.delete(progressId)
}

export function removeAllProgress() {
    watched.clear()
}

function updateProgressState(progressId: string, state: TransactionState) {
    const progress = watched.get(progressId)
    if (!progress) return

    progress.state = state
    WalletMessages.events.transactionProgressUpdated.sendToAll(progress)

    // stop watch progress
    if (isFinalProgress(progressId, state)) removeProgress(progressId)
}

function isFinalProgress(progressId: string, state: TransactionState) {
    const progress = watched.get(progressId)
    if (!progress) return false

    return [TransactionStateType.CONFIRMED, TransactionStateType.FAILED].includes(progress.state.type)
}

function isNextProgressAvailable(progressId: string, state: TransactionState) {
    const progress = watched.get(progressId)
    if (!progress) return false

    const type = state.type
    switch (type) {
        case TransactionStateType.UNKNOWN:
            return false
        case TransactionStateType.WAIT_FOR_CONFIRMING:
            return [TransactionStateType.UNKNOWN].includes(progress.state.type)
        case TransactionStateType.HASH:
            return [TransactionStateType.UNKNOWN, TransactionStateType.WAIT_FOR_CONFIRMING].includes(
                progress.state.type,
            )
        case TransactionStateType.RECEIPT:
            return [
                TransactionStateType.UNKNOWN,
                TransactionStateType.WAIT_FOR_CONFIRMING,
                TransactionStateType.HASH,
            ].includes(progress.state.type)
        case TransactionStateType.CONFIRMED:
            return [
                TransactionStateType.UNKNOWN,
                TransactionStateType.WAIT_FOR_CONFIRMING,
                TransactionStateType.HASH,
                TransactionStateType.RECEIPT,
            ].includes(progress.state.type)
        case TransactionStateType.FAILED:
            return [
                TransactionStateType.UNKNOWN,
                TransactionStateType.WAIT_FOR_CONFIRMING,
                TransactionStateType.HASH,
                TransactionStateType.RECEIPT,
            ].includes(progress.state.type)
        default:
            unreachable(type)
    }
}

export function notifyProgress(progressId: string, state: TransactionState) {
    const progress = watched.get(progressId)
    if (!progress) return
    if (isNextProgressAvailable(progressId, state)) updateProgressState(progressId, state)
}

export function notifyPayloadProgress(payload: JsonRpcPayload, state: TransactionState) {
    const progressId = helpers.getPayloadId(payload)
    notifyProgress(progressId, state)
}

export function notifyTransactionProgress(transaction: Transaction, state: TransactionState) {
    const progressId = helpers.getTransactionId(transaction)
    notifyProgress(progressId, state)
}
