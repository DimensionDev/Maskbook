import { memo, useCallback, useMemo } from 'react'
import { delay } from '@masknet/kit'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { ConnectWalletDialog, InjectedDialog, useSharedI18N } from '@masknet/shared'
import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { getRegisteredWeb3Providers } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
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

function getProviders() {
    const providers = getRegisteredWeb3Providers()

    return Sniffings.is_dashboard_page
        ? providers.filter((x) => x.providerAdaptorPluginID === NetworkPluginID.PLUGIN_EVM)
        : providers
}

interface SelectProviderProps {
    onClose: () => void
    open: boolean
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
    walletConnectedCallback?: () => void
}
export const SelectProvider = memo(function SelectProvider(props: SelectProviderProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { requiredSupportPluginID, requiredSupportChainIds, walletConnectedCallback, open, onClose } = props

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

            onClose()

            await delay(500)

            ConnectWalletDialog.open({
                networkType: network.type,
                providerType: provider.type,
                walletConnectedCallback,
            })
        },
        [onClose, walletConnectedCallback],
    )
    const providers = useMemo(getProviders, [])

    return (
        <InjectedDialog title={t.plugin_wallet_select_provider_dialog_title()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <PluginProviderRender
                    providers={providers}
                    onProviderIconClicked={onProviderIconClicked}
                    requiredSupportChainIds={requiredSupportChainIds}
                    requiredSupportPluginID={requiredSupportPluginID}
                />
            </DialogContent>
        </InjectedDialog>
    )
})
