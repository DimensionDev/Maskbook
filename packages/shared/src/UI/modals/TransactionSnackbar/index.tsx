import { forwardRef } from 'react'
import { Sniffings, type NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { TransactionSnackbar } from './TransactionSnackbar.js'

export type TransactionSnackbarOpenProps = void

export interface TransactionSnackbarProps {
    pluginID: NetworkPluginID
}

export const TransactionSnackbarModal = forwardRef<SingletonModalRefCreator, TransactionSnackbarProps>((props, ref) => {
    useSingletonModal(ref)

    if (Sniffings.is_popup_page) return null
    return <TransactionSnackbar pluginID={props.pluginID} />
})
