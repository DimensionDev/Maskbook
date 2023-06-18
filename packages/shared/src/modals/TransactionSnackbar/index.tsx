import { NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { useSingletonModal } from '../../index.js'
import { Transaction } from './Trasnaction.js'

export interface TransactionSnackbarOpenProps {
    pluginID?: NetworkPluginID
}

export interface TransactionSnackbarProps {}

export const TransactionModal = forwardRef<
    SingletonModalRefCreator<TransactionSnackbarOpenProps>,
    TransactionSnackbarProps
>((props, ref) => {
    const [pluginID, setPluginID] = useState<NetworkPluginID | undefined>()

    const [open, _] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props?.pluginID)
        },
    })

    if (!open) return null
    return <Transaction pluginID={pluginID ?? NetworkPluginID.PLUGIN_EVM} />
})
