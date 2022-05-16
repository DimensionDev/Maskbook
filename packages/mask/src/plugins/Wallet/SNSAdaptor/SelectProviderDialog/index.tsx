import { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { openWindow, useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import {
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    useNetworkDescriptor,
    useWeb3State,
    useWeb3UI,
<<<<<<< HEAD
    Web3Helper,
} from '@masknet/plugin-infra/web3'
=======
    Web3Plugin,
} from '@masknet/plugin-infra/web3'
import { isDashboardPage } from '@masknet/shared-base'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
>>>>>>> develop
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
<<<<<<< HEAD
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
=======
>>>>>>> develop
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

    const networks = getRegisteredWeb3Networks()
    const showNetworks = underPluginID ? networks.filter((x) => x.networkSupporterPluginID === underPluginID) : networks
    const providers = getRegisteredWeb3Providers()
    const pluginID = useValueRef(pluginIDSettings)
    const network = useNetworkDescriptor() as Web3Helper.NetworkDescriptorAll
    const [undeterminedPluginID, setUndeterminedPluginID] = useState(pluginID)
    const [undeterminedNetworkID, setUndeterminedNetworkID] = useState(network?.ID)

    const Web3State = useWeb3State(undeterminedPluginID) as Web3Helper.Web3StateAll
    const { Others, Provider } = Web3State

    const { NetworkIconClickBait, ProviderIconClickBait } =
        (useWeb3UI(undeterminedPluginID) as Web3Helper.Web3UIAll).SelectProviderDialog ?? {}

    const onNetworkIconClicked = useCallback((network: Web3Helper.NetworkDescriptorAll) => {
        setUndeterminedPluginID(network.networkSupporterPluginID)
        setUndeterminedNetworkID(network.ID)
    }, [])

    const onProviderIconClicked = useCallback(
        async (network: Web3Helper.NetworkDescriptorAll, provider: Web3Helper.ProviderDescriptorAll) => {
            if (!(await Provider?.isReady(provider.type))) {
                const downloadLink = Others?.providerResolver.providerDownloadLink(provider.type)
                if (downloadLink) openWindow(downloadLink)
                return
            }

<<<<<<< HEAD
            closeDialog()

            // TODO:
            // refactor to use react-router-dom
            setConnectWalletDialog({
                open: true,
                network,
                provider,
            })
        },
        [Others, Provider, closeDialog],
=======
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
>>>>>>> develop
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
                    onNetworkIconClicked={onNetworkIconClicked}
                    onProviderIconClicked={onProviderIconClicked}
                    NetworkIconClickBait={NetworkIconClickBait}
                    ProviderIconClickBait={ProviderIconClickBait}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
