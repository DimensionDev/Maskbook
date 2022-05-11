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

    // #region remote controlled dialog
    const { open, setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setPluginID(ev.network.networkSupporterPluginID)
            setNetworkType(ev.network.type)
            setProviderType(ev.provider.type)
        },
    )
    // #endregion

    const { Protocol, Others } = useWeb3State(pluginID) as Web3Helper.Web3StateAll

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        if (!networkType || !providerType || !Others || !Protocol) throw new Error('Failed to connect to provider.')

        const chainId = Others?.networkResovler.networkChainId(networkType)
        if (!chainId) throw new Error('Failed to connect to provider.')

        const connection = await Protocol.getConnection?.({
            chainId,
            providerType,
        })
        if (!connection) throw new Error('Failed to build connection.')

        const account = await connection.connect()

        console.log('DEBUG: account')
        console.log(account)

        setConnectWalletDialog({
            open: false,
        })

        return true
    }, [open])

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
