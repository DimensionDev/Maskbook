import { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import {
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    NetworkPluginID,
    useNetworkDescriptor,
    useNetworkType,
    useWeb3UI,
    Web3Plugin,
} from '@masknet/plugin-infra/web3'
import { isDashboardPage } from '@masknet/shared-base'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { WalletMessages, WalletRPC } from '../../messages'
import { hasNativeAPI, nativeAPI } from '../../../../../shared/native-rpc'
import { PluginProviderRender } from './PluginProviderRender'
import { pluginIDSettings } from '../../../../settings/settings'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(0, 0, 1, 0),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export interface SelectProviderDialogProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [underPluginID, setUnderPluginID] = useState<NetworkPluginID | undefined>()
    // #region remote controlled dialog logic
    // #endregion
    const { open, closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
        (ev?) => {
            if (!ev?.open) return
            setUnderPluginID(ev?.pluginID)
        },
    )
    // #region native app
    useEffect(() => {
        if (!open) return
        if (hasNativeAPI) nativeAPI?.api.misc_openCreateWalletView()
    }, [open, underPluginID])
    // #endregion

    const isDashboard = isDashboardPage()
    const networks = getRegisteredWeb3Networks()
    const showNetworks = underPluginID ? networks.filter((x) => x.networkSupporterPluginID === underPluginID) : networks
    const providers = getRegisteredWeb3Providers()
    const pluginID = useValueRef(pluginIDSettings) as NetworkPluginID
    const network = useNetworkDescriptor()
    const [undeterminedPluginID, setUndeterminedPluginID] = useState(pluginID)
    const [undeterminedNetworkID, setUndeterminedNetworkID] = useState(network?.ID ?? NetworkPluginID.PLUGIN_EVM)
    const undeterminedNetwork = useNetworkDescriptor(undeterminedNetworkID, undeterminedPluginID)

    const networkType = useNetworkType(undeterminedPluginID)

    const { NetworkIconClickBait, ProviderIconClickBait } = useWeb3UI(undeterminedPluginID).SelectProviderDialog ?? {}

    const onSubmit = useCallback(
        async (result?: Web3Plugin.ConnectionResult) => {
            if (result)
                await WalletRPC.updateAccount(result as Web3Plugin.ConnectionResult<ChainId, NetworkType, ProviderType>)

            if (undeterminedNetwork?.type === networkType) {
                pluginIDSettings.value = undeterminedPluginID
            }
            closeDialog()
            if (isDashboard) WalletMessages.events.walletStatusDialogUpdated.sendToLocal({ open: false })
        },
        [networkType, undeterminedNetwork?.type, undeterminedPluginID, closeDialog, isDashboard],
    )

    // not available for the native app
    if (hasNativeAPI) return null

    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <PluginProviderRender
                    networks={showNetworks}
                    providers={providers}
                    undeterminedPluginID={undeterminedPluginID}
                    undeterminedNetworkID={undeterminedNetworkID}
                    setUndeterminedPluginID={setUndeterminedPluginID}
                    setUndeterminedNetworkID={setUndeterminedNetworkID}
                    NetworkIconClickBait={NetworkIconClickBait}
                    ProviderIconClickBait={ProviderIconClickBait}
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
