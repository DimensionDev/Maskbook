import { memo, useCallback, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useMatch, useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { WalletHeaderUI } from './UI'
import {
    getRegisteredWeb3Networks,
    useAccount,
    useChainId,
    useProviderType,
    useWallet,
} from '@masknet/plugin-infra/web3'
import { Flags } from '../../../../../../../shared'
import { MenuItem, Typography } from '@mui/material'
import { useMenuConfig, WalletIcon, ChainIcon } from '@masknet/shared'
import { currentMaskWalletAccountSettings } from '../../../../../../plugins/Wallet/settings'
import { WalletRPC } from '../../../../../../plugins/Wallet/messages'
import { NormalHeader } from '../../../../components/NormalHeader'
import { NetworkDescriptor, NetworkPluginID } from '@masknet/web3-shared-base'

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

    const navigate = useNavigate()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType(NetworkPluginID.PLUGIN_EVM)

    const networks = getRegisteredWeb3Networks().filter(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as NetworkDescriptor<ChainId, NetworkType>[]

    const currentNetwork = useMemo(
        () => networks.find((x) => x.chainId === chainId) ?? networks[0],
        [networks, chainId],
    )

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
                            <WalletIcon size={20} networkIcon={network.icon} />
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

    if (!wallet) return <NormalHeader onlyTitle={!!matchWalletRecovered} />

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
                />
                {menu}
            </>
        )
    }

    return (matchSwitchWallet || matchWallet) && wallet ? (
        <>
            <WalletHeaderUI
                currentNetwork={currentNetwork}
                chainId={chainId}
                onOpenNetworkSelector={openMenu}
                onActionClick={() => navigate(matchSwitchWallet ? PopupRoutes.Wallet : PopupRoutes.SwitchWallet)}
                wallet={wallet}
                isSwitchWallet={!!matchSwitchWallet}
            />
            {menu}
        </>
    ) : (
        <NormalHeader />
    )
})
