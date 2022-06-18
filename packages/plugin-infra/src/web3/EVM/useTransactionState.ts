import { useReducer } from 'react'
import { isNextStateAvailable, TransactionState, TransactionStateType } from '@masknet/web3-shared-evm'

function txStateReducer(state: TransactionState, nextState: TransactionState) {
    const allowed = nextState.type === TransactionStateType.UNKNOWN || isNextStateAvailable(state.type, nextState.type)
    return allowed ? nextState : state
}

export function useTransactionState() {
    return useReducer(txStateReducer, {
        type: TransactionStateType.UNKNOWN,
    })
}
