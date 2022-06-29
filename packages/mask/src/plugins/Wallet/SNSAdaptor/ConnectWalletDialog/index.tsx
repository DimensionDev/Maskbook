import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { dialogClasses, DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import { useI18N } from '../../../../utils'
import { pluginIDSettings } from '../../../../settings/settings'
import { getSiteType } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2),
    },
    dialog: {
        [`.${dialogClasses.paper}`]: {
            minHeight: 'unset !important',
        },
    },
}))

export function ConnectWalletDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
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
        <InjectedDialog
            title={t('plugin_wallet_dialog_title')}
            open={open}
            className={classes.dialog}
            onClose={() => setConnectWalletDialog({ open: false })}>
            <DialogContent className={classes.content}>
                <ConnectionProgress
                    pluginID={pluginID}
                    providerType={providerType}
                    networkType={networkType}
                    connection={connection}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
