import { useCallback, useEffect, useMemo, useState } from 'react'
import { delay } from '@masknet/kit'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { EnhanceableSite, ExtensionSite, getSiteType, isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { openWindow, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { getRegisteredWeb3Networks, getRegisteredWeb3Providers } from '@masknet/plugin-infra'
import { useNetworkDescriptor, useWeb3State, useWeb3UI } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'

import { PluginProviderRender } from './PluginProviderRender.js'

import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(0, 0, 1, 0),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export interface SelectProviderDialogProps {
    pluginIDs: Record<EnhanceableSite | ExtensionSite, NetworkPluginID>
    hasNativeAPI: boolean
    misc_openCreateWalletView?: () => Promise<void>
}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()
    const [supportedNetworkList, setSupportedNetworkList] = useState<
        Array<Web3Helper.NetworkDescriptorAll['type']> | undefined
    >()
    const network = useNetworkDescriptor()
    const { pluginIDs, hasNativeAPI, misc_openCreateWalletView } = props

    const [undeterminedNetworkID, setUndeterminedNetworkID] = useState(network?.ID)
    // #region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, (ev) => {
        if (!ev.open) return
        setWalletConnectedCallback(() => ev.walletConnectedCallback)
        setSupportedNetworkList(ev.supportedNetworkList)
        if (ev.network) {
            setUndeterminedNetworkID(ev.network.ID)
            setUndeterminedPluginID(ev.network.networkSupporterPluginID)
        }
    })
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    // #endregion

    // #region native app
    useEffect(() => {
        if (!open) return
        if (hasNativeAPI) misc_openCreateWalletView?.()
    }, [open, misc_openCreateWalletView])
    // #endregion
    const site = getSiteType()
    const networks = getRegisteredWeb3Networks()
    const providers = getRegisteredWeb3Providers()
    const [undeterminedPluginID, setUndeterminedPluginID] = useState(site ? pluginIDs[site] : undefined)

    const Web3State = useWeb3State(undeterminedPluginID)
    const { Others, Provider } = Web3State

    const { NetworkIconClickBait, ProviderIconClickBait } = useWeb3UI(undeterminedPluginID).SelectProviderDialog ?? {}

    const onNetworkIconClicked = useCallback((network: Web3Helper.NetworkDescriptorAll) => {
        setUndeterminedPluginID(network.networkSupporterPluginID)
        setUndeterminedNetworkID(network.ID)
    }, [])

    const onProviderIconClicked = useCallback(
        async (network: Web3Helper.NetworkDescriptorAll, provider: Web3Helper.ProviderDescriptorAll) => {
            if (!Provider?.isReady(provider.type)) {
                const downloadLink = Others?.providerResolver.providerDownloadLink(provider.type)
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
        [Others, Provider, closeDialog, walletConnectedCallback],
    )

    const isDashboard = isDashboardPage()
    const selectedNetworks = useMemo(
        () =>
            isDashboard ? networks.filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM) : networks,
        [isDashboard, networks],
    )
    const selectedProviders = useMemo(
        () =>
            isDashboard ? providers.filter((x) => x.providerAdaptorPluginID === NetworkPluginID.PLUGIN_EVM) : providers,
        [isDashboard, networks],
    )
    if (hasNativeAPI) return null

    return (
        <InjectedDialog title={t.plugin_wallet_select_provider_dialog_title()} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <PluginProviderRender
                    networks={selectedNetworks}
                    providers={selectedProviders}
                    undeterminedPluginID={undeterminedPluginID}
                    supportedNetworkList={supportedNetworkList}
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
