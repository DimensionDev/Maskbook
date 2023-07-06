import { NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useMatch, useLocation } from 'react-router-dom'
import Services from '../../../../../service.js'
import { useConnected } from '../../hooks/useConnected.js'
import { WalletHeaderUI } from './UI.js'
import { getEvmNetworks } from '../../../../../../utils/networks.js'
import { NormalHeader, useModalNavigate } from '../../../../components/index.js'
import { WalletSetupHeaderUI } from './WalletSetupHeaderUI.js'
import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../../plugins/WalletService/messages.js'

export const WalletHeader = memo(function WalletHeader() {
    const modalNavigate = useModalNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const location = useLocation()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { value: hasPassword, retry } = useAsyncRetry(WalletRPC.hasPassword, [])

    const networks = useMemo(() => getEvmNetworks(true), [])

    const currentNetwork = useMemo(() => networks.find((x) => x.chainId === chainId) ?? networks[0], [chainId])
    const { connected, url } = useConnected()
    const matchWallet = useMatch(PopupRoutes.Wallet)
    const matchContractInteraction = useMatch(PopupRoutes.ContractInteraction)
    const matchCreatePassword = useMatch(PopupRoutes.CreatePassword)

    const chooseNetwork = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseNetwork)
    }, [modalNavigate])

    const handleActionClick = useCallback(() => {
        modalNavigate(PopupModalRoutes.SwitchWallet)
    }, [modalNavigate])

    useEffect(() => {
        retry()
    }, [location.pathname])

    if (matchCreatePassword) return null

    if (!wallet || !hasPassword) return <WalletSetupHeaderUI />

    if (matchContractInteraction) {
        return (
            <WalletHeaderUI
                chainId={chainId}
                connected={connected}
                currentNetwork={currentNetwork}
                disabled
                hiddenConnected={!url}
                onActionClick={handleActionClick}
                onOpenNetworkSelector={chooseNetwork}
                wallet={wallet}
            />
        )
    }

    return matchWallet ? (
        <WalletHeaderUI
            chainId={chainId}
            connected={connected}
            currentNetwork={currentNetwork}
            hiddenConnected={!url}
            onActionClick={handleActionClick}
            onOpenNetworkSelector={chooseNetwork}
            wallet={wallet}
        />
    ) : (
        <NormalHeader onClose={() => Services.Helper.removePopupWindow()} />
    )
})
