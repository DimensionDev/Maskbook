import { useAsyncRetry } from 'react-use'
import { DialogContent, dialogClasses } from '@mui/material'
import { InjectedDialog, useSharedTrans } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useWeb3Connection, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getSiteType, type NetworkPluginID, pluginIDsSettings } from '@masknet/shared-base'
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
    open: boolean
    onConnect: () => void
    onClose: () => void
}

export function ConnectWallet({ pluginID, networkType, providerType, open, onConnect, onClose }: ConnectWalletProps) {
    const { classes } = useStyles()
    const t = useSharedTrans()

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
            pluginIDsSettings.value = {
                ...pluginIDsSettings.value,
                [site]: pluginID,
            }
        }

        onConnect?.()

        return true
    }, [open])

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
