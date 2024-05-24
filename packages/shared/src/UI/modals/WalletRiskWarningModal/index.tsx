import { useState } from 'react'
import { NetworkPluginID, type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { WalletRiskWarning } from './WalletRiskWarning.js'

export interface WalletRiskWarningModalOpenProps {
    pluginID: NetworkPluginID
    account: string
}

export function WalletRiskWarningModal({ ref }: SingletonModalProps<WalletRiskWarningModalOpenProps>) {
    const [account, setAccount] = useState('')
    const [pluginID, setPluginID] = useState(NetworkPluginID.PLUGIN_EVM)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setAccount(props.account)
            setPluginID(props.pluginID)
        },
    })

    if (!open) return null
    return <WalletRiskWarning account={account} pluginID={pluginID} open onClose={() => dispatch?.close()} />
}
