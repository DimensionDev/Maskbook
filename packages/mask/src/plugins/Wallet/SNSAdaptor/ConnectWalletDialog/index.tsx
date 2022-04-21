import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
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
    const [providerType, setProviderType] = useState<string>()
    const [networkType, setNetworkType] = useState<string>()

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

    const { Provider, Utils } = useWeb3State(pluginID)

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        if (!networkType || !providerType || !Utils || !Provider) throw new Error('Failed to connect to provider.')

        await Provider.connect(Utils.getChainIdFromNetworkType(networkType), providerType)

        setConnectWalletDialog({
            open: false,
        })

        return true
    }, [open])

    if (!pluginID || !providerType) return null

    return (
        <InjectedDialog
            title={`Connect to ${Utils?.resolveProviderName(providerType)}`}
            open={open}
            onClose={() => setConnectWalletDialog({ open: false })}>
            <DialogContent className={classes.content}>
                <ConnectionProgress pluginID={pluginID} providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
