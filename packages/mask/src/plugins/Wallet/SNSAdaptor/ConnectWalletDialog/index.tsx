import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { WalletMessages } from '../../messages.js'
import { ConnectionProgress } from './ConnectionProgress.js'
import { pluginIDSettings } from '../../../../../shared/legacy-settings/settings.js'

export function ConnectWalletDialog() {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.Definition[NetworkPluginID]['ProviderType']>()
    const [networkType, setNetworkType] = useState<Web3Helper.Definition[NetworkPluginID]['NetworkType']>()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()

    // #region remote controlled dialog
    const { open, setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setPluginID(ev.network.networkSupporterPluginID)
            setNetworkType(ev.network.type)
            setProviderType(ev.provider.type)
            setWalletConnectedCallback(() => ev.walletConnectedCallback)
        },
    )
    // #endregion

    const { Connection, Others } = useWeb3State(pluginID)

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        if (!networkType || !providerType || !Others || !Connection) throw new Error('Failed to connect to provider.')

        const chainId = Others?.networkResolver.networkChainId(networkType)
        if (!chainId) throw new Error('Failed to connect to provider.')

        const connection = await Connection.getConnection?.({
            chainId,
            providerType,
        })
        if (!connection) throw new Error('Failed to build connection.')

        await connection.connect()

        const site = getSiteType()
        if (pluginID && site) {
            pluginIDSettings.value = {
                ...pluginIDSettings.value,
                [site]: pluginID,
            }
        }

        setConnectWalletDialog({
            open: false,
        })

        walletConnectedCallback?.()

        return true
    }, [open, walletConnectedCallback])

    if (!pluginID || !providerType || !networkType) return null

    return (
        <ConnectionProgress
            pluginID={pluginID}
            providerType={providerType}
            networkType={networkType}
            connection={connection}
        />
    )
}
