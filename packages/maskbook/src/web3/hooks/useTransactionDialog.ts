import { useEffect } from 'react'
import { EthereumMessages } from '../../plugins/Ethereum/messages'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { TransactionState, TransactionStateType } from './useTransactionState'

export function useTransactionDialog(
    transactionDialogEvent: {
        shareLink?: string
        summary?: string
    } | null,
    transactionState: TransactionState,
    transactionStateType: TransactionStateType,
    resetTransactionState: () => void,
) {
    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (transactionState.type !== transactionStateType) return
            resetTransactionState()
        },
    )

    // open the transation dialog
    useEffect(() => {
        if (transactionState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: transactionState,
            ...transactionDialogEvent,
        })
    }, [transactionState /* update tx dialog only if state changed */])
}
