import { forwardRef } from 'react'
import { NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { Transaction } from './Transaction.js'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'

export type TransactionSnackbarOpenProps = void

export interface TransactionSnackbarProps {
    pluginID: NetworkPluginID
}

export const TransactionSnackbarModal = forwardRef<
    SingletonModalRefCreator<TransactionSnackbarOpenProps>,
    TransactionSnackbarProps
>((props, ref) => {
    useSingletonModal(ref)

    return <Transaction pluginID={props.pluginID} />
})
