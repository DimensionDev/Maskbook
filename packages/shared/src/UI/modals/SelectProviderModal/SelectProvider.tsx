import { delay, getEnumAsArray } from '@masknet/kit'
import { getRegisteredWeb3Providers, MaskWalletProvider } from '@masknet/web3-providers'
import { ConnectWalletModal, InjectedDialog, useSharedTrans } from '@masknet/shared'
import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { PluginProviderRender } from './PluginProviderRender.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(0),
        minHeight: 430,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface SelectProviderProps {
    open: boolean
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
    onConnect?: () => void
    onClose: () => void
    createWallet(): void
}
export const SelectProvider = memo(function SelectProvider(props: SelectProviderProps) {
    const { open, requiredSupportPluginID, requiredSupportChainIds, onConnect, onClose, createWallet } = props
    const t = useSharedTrans()
    const { classes } = useStyles()

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
            // Create wallet first if no wallets yet.
            if (
                provider.type === ProviderType.MaskWallet &&
                !MaskWalletProvider.subscription.wallets.getCurrentValue().length
            ) {
                createWallet()
                return
            }

            onClose()
            await delay(500)

            const connected = await ConnectWalletModal.openAndWaitForClose({
                pluginID: network.networkSupporterPluginID,
                networkType: network.type,
                providerType: provider.type,
            })

            if (connected) onConnect?.()
            else onClose()
        },
        [onConnect, onClose],
    )
    const providers = useMemo(() => {
        if (Sniffings.is_dashboard_page) return getRegisteredWeb3Providers(NetworkPluginID.PLUGIN_EVM)
        if (requiredSupportPluginID) return getRegisteredWeb3Providers(requiredSupportPluginID)
        return getEnumAsArray(NetworkPluginID).flatMap((x) => getRegisteredWeb3Providers(x.value))
    }, [requiredSupportPluginID])

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
