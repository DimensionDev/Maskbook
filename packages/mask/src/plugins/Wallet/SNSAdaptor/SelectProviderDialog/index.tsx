import { useCallback, useMemo, useState } from 'react'
import { delay } from '@masknet/kit'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { openWindow, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { getRegisteredWeb3Networks, getRegisteredWeb3Providers } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { PluginProviderRender } from './PluginProviderRender.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(0),
        scrollbarWidth: 'none',
        minHeight: 430,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export function SelectProviderDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()

    // #region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, (ev) => {
        if (!ev.open) return
        setWalletConnectedCallback(() => ev.walletConnectedCallback)
    })
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    // #endregion

    const networks = getRegisteredWeb3Networks()
    const providers = getRegisteredWeb3Providers()

    const onProviderIconClicked = useCallback(
        async (
            network: Web3Helper.NetworkDescriptorAll,
            provider: Web3Helper.ProviderDescriptorAll,
            isReady?: boolean,
            downloadLink?: string,
        ) => {
            if (!isReady) {
                if (downloadLink) openWindow(downloadLink)
                return
            }

            closeDialog()

            await delay(500)

            setConnectWalletDialog({
                open: true,
                network,
                provider,
                walletConnectedCallback,
            })
        },
        [closeDialog, walletConnectedCallback],
    )

    const isDashboard = isDashboardPage()

    const selectedProviders = useMemo(
        () =>
            isDashboard ? providers.filter((x) => x.providerAdaptorPluginID === NetworkPluginID.PLUGIN_EVM) : providers,
        [isDashboard, networks],
    )
    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <PluginProviderRender
                    networks={networks}
                    providers={selectedProviders}
                    onProviderIconClicked={onProviderIconClicked}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
