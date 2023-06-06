import { memo, useCallback, useMemo } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { Flags } from '@masknet/flags'
import { PopupRoutes, NetworkPluginID } from '@masknet/shared-base'
import { ProviderType, type ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { MenuItem, Typography } from '@mui/material'
import { Web3 } from '@masknet/web3-providers'
import type { NetworkDescriptor } from '@masknet/web3-shared-base'
import { useMenuConfig, WalletIcon, ChainIcon } from '@masknet/shared'
import { WalletHeaderUI } from './UI.js'
import { NormalHeader } from '../../../../components/NormalHeader/index.js'
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
    const navigate = useNavigate()
    const { chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)

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
    const matchCreatePassword = useMatch(PopupRoutes.CreatePassword)

    const onChainChange = useCallback(async (chainId: ChainId) => {
        setChainId(chainId)
        await Web3.switchChain?.(chainId, {
            providerType: ProviderType.MaskWallet,
        })
    }, [])

    const [menu, openMenu] = useMenuConfig(
        networks
            .filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
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

    if (matchCreatePassword) return null

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
