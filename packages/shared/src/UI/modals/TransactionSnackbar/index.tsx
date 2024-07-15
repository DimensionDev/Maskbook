import { type NetworkPluginID, type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useTransactionSnackbar } from './TransactionSnackbar.js'

interface TransactionSnackbarProps extends SingletonModalProps {
    pluginID: NetworkPluginID
}

export function TransactionSnackbarModal({ ref, pluginID }: TransactionSnackbarProps) {
    useSingletonModal(ref)
    useTransactionSnackbar(pluginID)
    return null
}
