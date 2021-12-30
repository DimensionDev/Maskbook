import type { Transaction } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'
import { isFinalState, isNextStateAvailable, TransactionState } from '@masknet/web3-shared-evm'
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
    if (isFinalState(progress.state.type)) removeProgress(progressId)
}

export function notifyProgress(progressId: string, state: TransactionState) {
    const progress = watched.get(progressId)
    if (!progress) return
    if (isNextStateAvailable(progress.state.type, state.type)) updateProgressState(progressId, state)
}

export function notifyPayloadProgress(payload: JsonRpcPayload, state: TransactionState) {
    const progressId = helpers.getPayloadId(payload)
    notifyProgress(progressId, state)
}

export function notifyTransactionProgress(transaction: Transaction, state: TransactionState) {
    const progressId = helpers.getTransactionId(transaction)
    notifyProgress(progressId, state)
}
