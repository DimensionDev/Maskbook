import { NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import { WalletRPC } from '../../../../../../plugins/WalletService/messages.js'
import { getEvmNetworks } from '../../../../../../utils/networks.js'
import { NormalHeader, useModalNavigate } from '../../../../components/index.js'
import { WalletHeaderUI } from './UI.js'
import { WalletSetupHeaderUI } from './WalletSetupHeaderUI.js'

export const WalletHeader = memo(function WalletHeader() {
    const modalNavigate = useModalNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const location = useLocation()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { data: hasPassword, refetch } = useQuery(['has-password'], WalletRPC.hasPassword)
    useEffect(() => {
        refetch()
    }, [location.pathname])

    const networks = useMemo(() => getEvmNetworks(true), [])

    const currentNetwork = useMemo(() => networks.find((x) => x.chainId === chainId) ?? networks[0], [chainId])
    const matchUnlock = useMatch(PopupRoutes.Unlock)
    const matchResetWallet = useMatch(PopupRoutes.ResetWallet)
    const matchWallet = useMatch(PopupRoutes.Wallet)
    const matchAddAssets = useMatch(`${PopupRoutes.AddToken}/:chainId/:assetType`)
    const matchExportPrivateKey = useMatch(PopupRoutes.ExportWalletPrivateKey)
    const matchContractInteraction = useMatch(PopupRoutes.ContractInteraction)

    const chooseNetwork = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseNetwork)
    }, [modalNavigate])

    const handleActionClick = useCallback(() => {
        modalNavigate(PopupModalRoutes.SwitchWallet)
    }, [modalNavigate])

    if (matchAddAssets || matchExportPrivateKey) return null

    if (!wallet || !hasPassword || matchUnlock || matchResetWallet) return <WalletSetupHeaderUI />

    if (matchContractInteraction) {
        return (
            <WalletHeaderUI
                chainId={chainId}
                currentNetwork={currentNetwork}
                disabled
                onActionClick={handleActionClick}
                onOpenNetworkSelector={chooseNetwork}
                wallet={wallet}
            />
        )
    }

    return matchWallet ? (
        <WalletHeaderUI
            chainId={chainId}
            currentNetwork={currentNetwork}
            onActionClick={handleActionClick}
            onOpenNetworkSelector={chooseNetwork}
            wallet={wallet}
        />
    ) : (
        <NormalHeader />
    )
})
