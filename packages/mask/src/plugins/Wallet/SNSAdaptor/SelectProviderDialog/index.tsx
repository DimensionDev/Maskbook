import { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared'
import {
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    useNetworkDescriptor,
    useNetworkType,
    useWeb3UI,
} from '@masknet/plugin-infra'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { WalletMessages } from '../../messages'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { hasNativeAPI, nativeAPI } from '../../../../utils'
import { PluginProviderRender } from './PluginProviderRender'
import { networkIDSettings, pluginIDSettings } from '../../../../settings/settings'

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

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    //#endregion

    //#region native app
    useEffect(() => {
        if (!open) return
        if (hasNativeAPI) nativeAPI?.api.misc_openCreateWalletView()
    }, [open])
    //#endregion

    const networks = getRegisteredWeb3Networks()
    const providers = getRegisteredWeb3Providers()

    const pluginID = useValueRef(pluginIDSettings)
    const networkID = useValueRef(networkIDSettings)
    const [undeterminedPluginID, setUndeterminedPluginID] = useState(pluginID)
    const [undeterminedNetworkID, setUndeterminedNetworkID] = useState(networkID)
    const undeterminedNetwork = useNetworkDescriptor(undeterminedNetworkID, undeterminedPluginID)

    const networkType = useNetworkType(undeterminedPluginID)

    const { NetworkIconClickBait, ProviderIconClickBait } = useWeb3UI(undeterminedPluginID).SelectProviderDialog ?? {}

    const onSubmit = useCallback(() => {
        if (undeterminedNetwork?.type === networkType) {
            pluginIDSettings.value = undeterminedPluginID
            networkIDSettings.value = undeterminedNetworkID
        }
        closeDialog()
    }, [networkType, undeterminedNetwork?.type, undeterminedPluginID, undeterminedNetworkID, closeDialog])

    // not available for the native app
    if (hasNativeAPI) return null

    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <PluginProviderRender
                    networks={networks}
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
