import { NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { useAccount, useChainContext, useNetwork } from '@masknet/web3-hooks-base'
import { memo, useCallback } from 'react'
import { matchPath, useLocation, useMatch, useSearchParams } from 'react-router-dom'
import Services from '#services'
import { NormalHeader, useModalNavigate } from '../../../../components/index.js'
import { WalletHeaderUI } from './UI.js'

const CUSTOM_HEADER_PATTERNS = [`${PopupRoutes.AddToken}/:chainId/:assetType`, PopupRoutes.Transfer]

export const WalletHeader = memo(function WalletHeader() {
    const modalNavigate = useModalNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const location = useLocation()
    const account = useAccount()
    const [params] = useSearchParams()
    const origin = params.get('source')

    const currentNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const matchWallet = PopupRoutes.Wallet === location.pathname
    const customHeader = CUSTOM_HEADER_PATTERNS.some((pattern) => matchPath(pattern, location.pathname))
    const matchContractInteraction = useMatch(PopupRoutes.ContractInteraction)

    const chooseNetwork = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseNetwork)
    }, [modalNavigate])

    const handleActionClick = useCallback(() => {
        modalNavigate(PopupModalRoutes.SelectProvider)
    }, [modalNavigate])

    if (customHeader) return null
    if (!account) return null

    if (matchContractInteraction) {
        return (
            <WalletHeaderUI
                origin={origin}
                chainId={chainId}
                currentNetwork={currentNetwork}
                disabled
                disableCopy
                onActionClick={handleActionClick}
                onOpenNetworkSelector={chooseNetwork}
                address={account}
            />
        )
    }

    return matchWallet ?
            <WalletHeaderUI
                origin={origin}
                chainId={chainId}
                currentNetwork={currentNetwork}
                onActionClick={handleActionClick}
                onOpenNetworkSelector={chooseNetwork}
                address={account}
            />
        :   <NormalHeader onClose={() => Services.Helper.removePopupWindow()} />
})
