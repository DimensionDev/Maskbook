import { NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { useChainContext, useNetwork, useWallet } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import { memo, useCallback, useEffect } from 'react'
import { matchPath, useLocation, useMatch } from 'react-router-dom'
import { NormalHeader, useModalNavigate } from '../../../../components/index.js'
import { WalletHeaderUI } from './UI.js'
import { WalletSetupHeaderUI } from './WalletSetupHeaderUI.js'
import Services from '#services'

const CUSTOM_HEADER_PATTERNS = [
    `${PopupRoutes.AddToken}/:chainId/:assetType`,
    PopupRoutes.Transfer,
    PopupRoutes.ExportWalletPrivateKey,
]

export const WalletHeader = memo(function WalletHeader() {
    const modalNavigate = useModalNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const location = useLocation()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { data: hasPassword, refetch } = useQuery(['has-password'], Services.Wallet.hasPassword)
    useEffect(() => {
        refetch()
    }, [location.pathname])

    const currentNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const matchUnlock = useMatch(PopupRoutes.Unlock)
    const matchResetWallet = useMatch(PopupRoutes.ResetWallet)
    const matchWallet = useMatch(PopupRoutes.Wallet)
    const customHeader = CUSTOM_HEADER_PATTERNS.some((pattern) => matchPath(pattern, location.pathname))
    const matchContractInteraction = useMatch(PopupRoutes.ContractInteraction)

    const chooseNetwork = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseNetwork)
    }, [modalNavigate])

    const handleActionClick = useCallback(() => {
        modalNavigate(PopupModalRoutes.SwitchWallet)
    }, [modalNavigate])

    if (customHeader) return null

    if (matchContractInteraction) {
        if (!wallet) return null
        return (
            <WalletHeaderUI
                chainId={chainId}
                currentNetwork={currentNetwork}
                disabled
                disableCopy
                onActionClick={handleActionClick}
                onOpenNetworkSelector={chooseNetwork}
                wallet={wallet}
            />
        )
    }

    if (!wallet || !hasPassword || matchUnlock || matchResetWallet)
        return <WalletSetupHeaderUI showBack={!!matchResetWallet} />

    return matchWallet ? (
        <WalletHeaderUI
            chainId={chainId}
            currentNetwork={currentNetwork}
            onActionClick={handleActionClick}
            onOpenNetworkSelector={chooseNetwork}
            wallet={wallet}
        />
    ) : (
        <NormalHeader onClose={() => Services.Helper.removePopupWindow()} />
    )
})
