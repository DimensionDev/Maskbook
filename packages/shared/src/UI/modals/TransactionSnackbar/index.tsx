import { forwardRef } from 'react'
import { type NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { TransactionSnackbar } from './TransactionSnackbar.js'

interface TransactionSnackbarProps {
    pluginID: NetworkPluginID
}

export const TransactionSnackbarModal = forwardRef<SingletonModalRefCreator, TransactionSnackbarProps>((props, ref) => {
    useSingletonModal(ref)

    return <TransactionSnackbar pluginID={props.pluginID} />
})
