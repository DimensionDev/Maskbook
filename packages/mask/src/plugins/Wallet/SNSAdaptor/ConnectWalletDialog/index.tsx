import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent, dialogClasses } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getSiteType } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ConnectionProgress } from './ConnectionProgress.js'
import { useI18N } from '../../../../utils/index.js'
import { pluginIDSettings } from '../../../../../shared/legacy-settings/settings.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2),
    },
    dialog: {
        minHeight: 'auto !important',
        [`.${dialogClasses.paper}`]: {
            minHeight: 'unset !important',
        },
    },
}))

export function ConnectWalletDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()
    const [networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()
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

        const connection = Connection.getConnection?.({
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
            onClose={() => setConnectWalletDialog({ open: false })}
            maxWidth="sm"
            className={classes.dialog}>
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
