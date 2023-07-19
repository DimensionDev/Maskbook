import { memo, useCallback, useMemo } from 'react'
import { delay, getEnumAsArray } from '@masknet/kit'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { ConnectWalletModal, InjectedDialog, useSharedI18N } from '@masknet/shared'
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

export interface SelectProviderProps {
    open: boolean
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
    onConnect?: () => void
    onClose: () => void
}
export const SelectProvider = memo(function SelectProvider(props: SelectProviderProps) {
    const { open, requiredSupportPluginID, requiredSupportChainIds, onConnect, onClose } = props
    const t = useSharedI18N()
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
