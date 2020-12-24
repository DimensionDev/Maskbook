import { useEffect } from 'react'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { TransactionState, TransactionStateType } from './useTransactionState'

export function useTransactionDialog(
    transactionDialogEvent: {
        shareLink?: string
        summary?: string
    },
    transactionState: TransactionState,
    resetTransactionState: () => void,
) {
    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
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
