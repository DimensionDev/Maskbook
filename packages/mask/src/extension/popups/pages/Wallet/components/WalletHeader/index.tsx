import { memo, useCallback, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { WalletHeaderUI } from './UI.js'
import {
    getRegisteredWeb3Networks,
    useAccount,
    useChainId,
    useProviderType,
    useWallet,
} from '@masknet/plugin-infra/web3'
import { Flags } from '../../../../../../../shared/index.js'
import { MenuItem, Typography } from '@mui/material'
import { useMenuConfig, WalletIcon, ChainIcon } from '@masknet/shared'
import { currentMaskWalletAccountSettings } from '../../../../../../../shared/legacy-settings/wallet-settings.js'
import { WalletRPC } from '../../../../../../plugins/Wallet/messages.js'
import { NormalHeader } from '../../../../components/NormalHeader/index.js'
import { NetworkDescriptor, NetworkPluginID } from '@masknet/web3-shared-base'
import Services from '../../../../../service.js'
import { useConnected } from '../../hooks/useConnected.js'

const useStyles = makeStyles()({
    menu: {
        maxHeight: 466,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
})

export const WalletHeader = memo(() => {
    const { classes } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType(NetworkPluginID.PLUGIN_EVM)

    const networks = getRegisteredWeb3Networks().filter(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as Array<NetworkDescriptor<ChainId, NetworkType>>

    const currentNetwork = useMemo(
        () => networks.find((x) => x.chainId === chainId) ?? networks[0],
        [networks, chainId],
    )
    const { connected, url } = useConnected()
    const matchWallet = useMatch(PopupRoutes.Wallet)
    const matchSwitchWallet = useMatch(PopupRoutes.SwitchWallet)
    const matchContractInteraction = useMatch(PopupRoutes.ContractInteraction)
    const matchWalletRecovered = useMatch(PopupRoutes.WalletRecovered)

    const onChainChange = useCallback(
        async (chainId: ChainId) => {
            return WalletRPC.updateMaskAccount({
                chainId,
                account: currentMaskWalletAccountSettings.value,
            })
        },
        [providerType, account],
    )

    const [menu, openMenu] = useMenuConfig(
        networks
            ?.filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
            .filter((x) => (Flags.support_testnet_switch ? true : x.isMainnet))
            .map((network) => {
                const chainId = network.chainId

                return (
                    <MenuItem
                        key={chainId}
                        onClick={() => onChainChange(chainId)}
                        selected={chainId === currentNetwork.chainId}>
                        {network.isMainnet ? (
                            <WalletIcon size={20} mainIcon={network.icon} />
                        ) : Flags.support_testnet_switch ? (
                            <ChainIcon color={network.iconColor} />
                        ) : null}
                        <Typography sx={{ marginLeft: 1 }}>{network.name}</Typography>
                    </MenuItem>
                )
            }) ?? [],
        {
            classes: { paper: classes.menu },
        },
    )

    if (!wallet) return <NormalHeader onlyTitle={!!matchWalletRecovered} onClose={Services.Helper.removePopupWindow} />

    if (matchContractInteraction && wallet) {
        return (
            <>
                <WalletHeaderUI
                    currentNetwork={currentNetwork}
                    chainId={chainId}
                    onOpenNetworkSelector={openMenu}
                    onActionClick={() => navigate(matchSwitchWallet ? PopupRoutes.Wallet : PopupRoutes.SwitchWallet)}
                    wallet={wallet}
                    isSwitchWallet={!!matchSwitchWallet}
                    disabled
                    connected={connected}
                    hiddenConnected={!url}
                />
                {menu}
            </>
        )
    }

    return (matchSwitchWallet || matchWallet) && wallet ? (
        <>
            <WalletHeaderUI
                connected={connected}
                currentNetwork={currentNetwork}
                chainId={chainId}
                onOpenNetworkSelector={openMenu}
                onActionClick={() => navigate(matchSwitchWallet ? PopupRoutes.Wallet : PopupRoutes.SwitchWallet)}
                wallet={wallet}
                isSwitchWallet={!!matchSwitchWallet}
                hiddenConnected={!url}
            />
            {menu}
        </>
    ) : (
        <NormalHeader onClose={() => Services.Helper.removePopupWindow()} />
    )
})
