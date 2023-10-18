import { forwardRef, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useWeb3Connection, useWeb3Others } from '@masknet/web3-hooks-base'
import { NetworkPluginID, getSiteType, type SingletonModalRefCreator, pluginIDsSettings } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ConnectWallet } from './ConnectWallet.js'

export interface ConnectWalletModalOpenProps {
    pluginID: NetworkPluginID
    networkType: Web3Helper.NetworkTypeAll
    providerType: Web3Helper.ProviderTypeAll
}

export type ConnectWalletModalCloseProps = boolean

export const ConnectWalletModal = forwardRef<
    SingletonModalRefCreator<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>
>((props, ref) => {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()
    const [networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()

    const Web3 = useWeb3Connection(pluginID, { providerType })
    const Others = useWeb3Others(pluginID)

    const [connection, onConnect] = useAsyncFn<() => Promise<true>>(async () => {
        if (!networkType || !providerType) throw new Error('Failed to connect to provider.')

        const chainId = Others.networkResolver.networkChainId(networkType)
        if (!chainId) throw new Error('Failed to connect to provider.')

        try {
            const account = await Web3.connect({
                chainId,
            })
            if (!account) throw new Error('Failed to build connection.')
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to connect to provider.')
        }

        const site = getSiteType()

        if (pluginID && site) {
            pluginIDsSettings.value = {
                ...pluginIDsSettings.value,
                [site]: pluginID,
            }
        }

        return true
    }, [networkType, providerType, pluginID, Others, Web3])

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            setPluginID(props.pluginID ?? NetworkPluginID.PLUGIN_EVM)
            setProviderType(props.providerType)
            setNetworkType(props.networkType)

            // connect to wallet
            await onConnect()
            dispatch?.close(true)
        },
    })

    if (!open) return null

    return (
        <ConnectWallet
            pluginID={pluginID}
            providerType={providerType}
            networkType={networkType}
            connection={connection}
            open
            onConnect={onConnect}
            onClose={() => dispatch?.close(false)}
        />
    )
})
