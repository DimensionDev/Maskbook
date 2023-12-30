import { NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { useChainContext, useNetwork, useWallet } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { matchPath, useLocation, useMatch, useSearchParams } from 'react-router-dom'
import Services from '#services'
import { NormalHeader, useModalNavigate } from '../../../../components/index.js'
import { WalletHeaderUI } from './UI.js'
import { WalletSetupHeaderUI } from './WalletSetupHeaderUI.js'

const CUSTOM_HEADER_PATTERNS = [
    `${PopupRoutes.AddToken}/:chainId/:assetType`,
    PopupRoutes.Transfer,
    PopupRoutes.ExportWalletPrivateKey,
]

export const WalletHeader = memo(function WalletHeader() {
    const modalNavigate = useModalNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const location = useLocation()
    const wallet = useWallet()
    const { data: hasPassword } = useQuery({
        queryKey: ['@@has-password'],
        queryFn: Services.Wallet.hasPassword,
        networkMode: 'always',
    })
    const [params] = useSearchParams()
    const origin = params.get('source')

    const currentNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const matchResetWallet = useMatch(PopupRoutes.ResetWallet)
    const matchWallet = PopupRoutes.Wallet === location.pathname
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
                origin={origin}
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

    if (!wallet || !hasPassword || matchResetWallet) return <WalletSetupHeaderUI showBack={!!matchResetWallet} />

    return matchWallet ?
            <WalletHeaderUI
                origin={origin}
                chainId={chainId}
                currentNetwork={currentNetwork}
                onActionClick={handleActionClick}
                onOpenNetworkSelector={chooseNetwork}
                wallet={wallet}
            />
        :   <NormalHeader onClose={() => Services.Helper.removePopupWindow()} />
})
