import type {
    EnhanceableSite,
    ExtensionSite,
    NetworkPluginID,
    SingletonModalRefCreator,
    ValueRefWithReady,
} from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { useSingletonModal } from '../../index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ConnectWallet } from './ConnectWallet.js'

export interface ConnectWalletDialogOpenProps {
    pluginIDSettings?: ValueRefWithReady<Record<EnhanceableSite | ExtensionSite, NetworkPluginID>>
    pluginID?: NetworkPluginID
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
    walletConnectedCallback?: () => void
}

export interface ConnectWalletDialogProps {}

export const ConnectWalletModal = forwardRef<
    SingletonModalRefCreator<ConnectWalletDialogOpenProps>,
    ConnectWalletDialogProps
>((props, ref) => {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()
    const [networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props?.pluginID)
            setProviderType(props?.providerType)
            setNetworkType(props?.networkType)
            setWalletConnectedCallback(() => props?.walletConnectedCallback)
        },
    })

    if (!open) return null
    return (
        <ConnectWallet
            open
            pluginID={pluginID}
            providerType={providerType}
            networkType={networkType}
            walletConnectedCallback={walletConnectedCallback}
            onClose={() => dispatch?.close()}
        />
    )
})
