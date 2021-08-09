import { useEffect } from 'react'
import { TransactionState, TransactionStateType } from '@masknet/web3-shared'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '@masknet/shared'

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
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.transactionDialogUpdated, (ev) => {
        if (ev.open) return
        if (transactionState.type !== transactionStateType) return
        resetTransactionState()
    })

    // open the transation dialog
    useEffect(() => {
        if (transactionState.type === TransactionStateType.UNKNOWN) return
        setDialog({
            open: true,
            state: transactionState,
            ...transactionDialogEvent,
        })
    }, [transactionState /* update tx dialog only if state changed */])
}
