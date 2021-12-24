import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { useRemoteControlledDialog } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import {
    getChainIdFromNetworkType,
    isFortmaticSupported,
    isInjectedProvider,
    NetworkType,
    ProviderType,
    resolveProviderDownloadLink,
} from '@masknet/web3-shared-evm'
import { WalletMessages } from '../../../Wallet/messages'
import { useInjectedProviderType } from '../../hooks'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onClick,
    onSubmit,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    //#region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (ev.result) onSubmit?.(network, provider)
        },
    )
    //#endregion

    const providerType = provider.type as ProviderType
    const networkType = network.type as NetworkType

    const injectedEthereumProviderType = useInjectedProviderType('ethereum')
    const injectedCoin98ProviderType = useInjectedProviderType('coin98')

    const onClickProvider = useCallback(async () => {
        // open the download page
        if (isInjectedProvider(providerType)) {
            const isProviderAvailable =
                providerType === ProviderType.Coin98
                    ? providerType === injectedCoin98ProviderType
                    : providerType === injectedEthereumProviderType

            if (!isProviderAvailable) {
                const downloadLink = resolveProviderDownloadLink(providerType)
                if (downloadLink) window.open(downloadLink, '_blank', 'noopener noreferrer')
                return
            }
        }

        switch (providerType) {
            case ProviderType.MaskWallet:
            case ProviderType.MetaMask:
            case ProviderType.WalletConnect:
            case ProviderType.Coin98:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
            case ProviderType.Fortmatic:
                setConnectWalletDialog({
                    open: true,
                    providerType,
                    networkType,
                })
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                unreachable(providerType)
        }
        onClick?.(network, provider)
    }, [network, provider, injectedEthereumProviderType, injectedCoin98ProviderType, onClick])

    // hide injected provider in dashboard
    if (isInjectedProvider(providerType) && isDashboardPage()) return null

    // hide fortmatic for some networks because of incomplete supporting
    if (providerType === ProviderType.Fortmatic && !isFortmaticSupported(getChainIdFromNetworkType(networkType)))
        return null

    // hide fortmatic and coin98 wallets
    if (providerType === ProviderType.Fortmatic || providerType === ProviderType.Coin98) return null

    // coinbase and mathwallet are blocked by CSP
    if ([ProviderType.WalletLink, ProviderType.MathWallet].includes(providerType)) return null

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      ...children.props,
                      ...{
                          onClick: onClickProvider,
                      },
                  })
                : children}
        </>
    )
}
