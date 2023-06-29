import { forwardRef, useState } from 'react'
import { NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ConnectWallet } from './ConnectWallet.js'

export interface ConnectWalletModalOpenProps {
    pluginID: NetworkPluginID
    networkType: Web3Helper.NetworkTypeAll
    providerType: Web3Helper.ProviderTypeAll
}

export type ConnectWalletModalCloseProps = boolean

export interface ConnectWalletModalProps {}

export const ConnectWalletModal = forwardRef<
    SingletonModalRefCreator<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>,
    ConnectWalletModalProps
>((props, ref) => {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()
    const [networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props.pluginID ?? NetworkPluginID.PLUGIN_EVM)
            setProviderType(props.providerType)
            setNetworkType(props.networkType)
        },
    })

    if (!open) return null
    return (
        <ConnectWallet
            open
            pluginID={pluginID}
            providerType={providerType}
            networkType={networkType}
            onConnect={() => dispatch?.close(true)}
            onClose={() => dispatch?.close(false)}
        />
    )
})
