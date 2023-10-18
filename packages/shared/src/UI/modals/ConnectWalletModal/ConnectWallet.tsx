import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'
import { DialogContent, dialogClasses } from '@mui/material'
import { InjectedDialog, useSharedTrans } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
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
    onConnect: () => Promise<true>
    onClose: () => void
    connection: AsyncFnReturn<() => Promise<true>>[0]
}

export function ConnectWallet({
    pluginID,
    networkType,
    providerType,
    connection,
    open,
    onConnect,
    onClose,
}: ConnectWalletProps) {
    const { classes } = useStyles()
    const t = useSharedTrans()

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
                    onRetry={onConnect}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
