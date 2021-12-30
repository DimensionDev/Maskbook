import { useEffect } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { TransactionState, TransactionStateType } from '@masknet/web3-shared-evm'
import { WalletMessages } from '../../plugins/Wallet/messages'

export function useTransactionDialog(
    event: {
        shareLink?: string
        summary?: string
    } | null,
    state: TransactionState,
    stateType: TransactionStateType.HASH | TransactionStateType.CONFIRMED,
    resetCallback: () => void,
) {
    // close the transaction dialog
    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.transactionDialogUpdated, (ev) => {
        if (ev.open) return
        if (state.type !== stateType) return
        resetCallback()
    })

    // open the transaction dialog
    useEffect(() => {
        if (state.type === TransactionStateType.UNKNOWN) return
        setDialog({
            open: open || state.type === TransactionStateType.WAIT_FOR_CONFIRMING,
            state: state,
            ...event,
        })
    }, [state /* update tx dialog only if state changed */])
}
