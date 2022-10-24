import { useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { ConnectionProgress } from './ConnectionProgress.js'
import { pluginIDSettings } from '../../../../../shared/legacy-settings/settings.js'
import type { ConnectWalletDialogEvent } from '@masknet/plugin-wallet'
import { useLocation } from 'react-router-dom'

export interface ConnectWalletDialogProps {
    closeDialog: () => void
}
export function ConnectWalletDialog({ closeDialog }: ConnectWalletDialogProps) {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.Definition[NetworkPluginID]['ProviderType']>()
    const [networkType, setNetworkType] = useState<Web3Helper.Definition[NetworkPluginID]['NetworkType']>()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()

    const location = useLocation()
    const state = location.state as ConnectWalletDialogEvent | undefined

    useEffect(() => {
        if (!state) return
        if (state.network) {
            setPluginID(state.network.networkSupporterPluginID)
            setNetworkType(state.network.type)
        }
        if (state.provider) {
            setProviderType(state.provider.type)
        }
        if (state.walletConnectedCallback) {
            setWalletConnectedCallback(() => state.walletConnectedCallback)
        }
    }, [state])

    const { Connection, Others } = useWeb3State(pluginID)

    const connection = useAsyncRetry<true>(async () => {
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

        closeDialog()

        walletConnectedCallback?.()

        return true
    }, [walletConnectedCallback, networkType, providerType])

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
