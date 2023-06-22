import { NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { useSingletonModal } from '../../index.js'
import { Transaction } from './Transaction.js'

export interface TransactionSnackbarOpenProps {
    pluginID?: NetworkPluginID
}

export interface TransactionSnackbarProps {}

export const TransactionModal = forwardRef<
    SingletonModalRefCreator<TransactionSnackbarOpenProps>,
    TransactionSnackbarProps
>((props, ref) => {
    const [pluginID, setPluginID] = useState<NetworkPluginID | undefined>()

    useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props.pluginID)
        },
    })

    return <Transaction pluginID={pluginID ?? NetworkPluginID.PLUGIN_EVM} />
})
