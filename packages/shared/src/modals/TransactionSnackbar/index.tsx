import { forwardRef } from 'react'
import type { NetworkPluginID, SingletonModalRefCreator } from '@masknet/shared-base'
import { TransactionSnackbar } from './TransactionSnackbar.js'
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

    return <TransactionSnackbar pluginID={props.pluginID} />
})
