import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import { pluginIDSettings } from '../../../../settings/settings'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2.5),
    },
}))

export interface ConnectWalletDialogProps {}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
    const classes = useStylesExtends(useStyles(), props)

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

    const { Connection, Others } = useWeb3State<'all'>(pluginID)

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

        if (pluginID) {
            pluginIDSettings.value = pluginID
        }

        setConnectWalletDialog({
            open: false,
        })

        walletConnectedCallback?.()

        return true
    }, [open, walletConnectedCallback])

    if (!pluginID || !providerType) return null

    return (
        <InjectedDialog
            title={`Connect to ${Others?.providerResolver.providerName(providerType)}`}
            open={open}
            onClose={() => setConnectWalletDialog({ open: false })}>
            <DialogContent className={classes.content}>
                <ConnectionProgress pluginID={pluginID} providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
