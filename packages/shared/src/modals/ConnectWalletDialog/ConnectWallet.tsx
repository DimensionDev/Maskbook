import { useAsyncRetry } from 'react-use'
import { DialogContent, dialogClasses } from '@mui/material'
import { ConnectWalletDialog, InjectedDialog, useSharedI18N } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useWeb3Connection, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    getSiteType,
    type NetworkPluginID,
    pluginIDSettings,
} from '@masknet/shared-base'
import { ConnectionProgress } from './ConnectionProgress.js'

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

interface ConnectWalletProps {
    pluginID?: NetworkPluginID
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
    walletConnectedCallback?: () => void
    open: boolean
    onClose: () => void
}

export function ConnectWallet({
    pluginID,
    networkType,
    providerType,
    walletConnectedCallback,
    open,
    onClose,
}: ConnectWalletProps) {
    const { classes } = useStyles()
    const t = useSharedI18N()

    const Web3 = useWeb3Connection(pluginID, { providerType })
    const Others = useWeb3Others(pluginID)

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        if (!networkType || !providerType) throw new Error('Failed to connect to provider.')

        const chainId = Others.networkResolver.networkChainId(networkType)
        if (!chainId) throw new Error('Failed to connect to provider.')

        const account = await Web3.connect({
            chainId,
        })
        if (!account) throw new Error('Failed to build connection.')

        const site = getSiteType()

        if (pluginID && site) {
            pluginIDSettings.value = {
                ...pluginIDSettings?.value,
                [site]: pluginID,
            }
        }

        ConnectWalletDialog.open({ pluginIDSettings })

        walletConnectedCallback?.()

        return true
    }, [open, walletConnectedCallback, Others, Web3, pluginIDSettings])

    if (!pluginID || !providerType || !networkType) return null

    return (
        <InjectedDialog
            title={t.plugin_wallet_dialog_title()}
            open={open}
            onClose={onClose}
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
