import { useCallback, useEffect, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { openWindow, useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { getRegisteredWeb3Networks, getRegisteredWeb3Providers } from '@masknet/plugin-infra'
import { useNetworkDescriptor, useWeb3State, useWeb3UI } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { WalletMessages } from '../../messages.js'
import { hasNativeAPI, nativeAPI } from '../../../../../shared/native-rpc/index.js'
import { PluginProviderRender } from './PluginProviderRender.js'
import { pluginIDSettings } from '../../../../../shared/legacy-settings/settings.js'
import { getSiteType, isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { useLocation } from 'react-router-dom'
import type { SelectProviderDialogEvent } from '@masknet/plugin-wallet'

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
    closeDialog?: () => void
}

export function SelectProviderDialog({ closeDialog }: SelectProviderDialogProps) {
    const { classes } = useStyles()
    const location = useLocation()
    const state = location.state as SelectProviderDialogEvent | undefined
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()
    const [supportedNetworkList, setSupportedNetworkList] = useState<
        Array<Web3Helper.NetworkDescriptorAll['type']> | undefined
    >()
    const network = useNetworkDescriptor()
    const [undeterminedNetworkID, setUndeterminedNetworkID] = useState(network?.ID)

    useEffect(() => {
        setWalletConnectedCallback(() => state?.walletConnectedCallback)
        setSupportedNetworkList(state?.supportedNetworkList)
        if (state?.network) {
            setUndeterminedNetworkID(state?.network.ID)
            setUndeterminedNetworkID(state?.network.networkSupporterPluginID)
        }
    }, [state])
    // #region remote controlled dialog logic
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    // #endregion

    // #region native app
    useEffect(() => {
        if (!open) return
        if (hasNativeAPI) nativeAPI?.api.misc_openCreateWalletView()
    }, [open])
    // #endregion

    const site = getSiteType()
    const networks = getRegisteredWeb3Networks()
    const providers = getRegisteredWeb3Providers()
    const pluginIDs = useValueRef(pluginIDSettings)
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

            // TODO:
            // refactor to use react-router-dom
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
    )
}
