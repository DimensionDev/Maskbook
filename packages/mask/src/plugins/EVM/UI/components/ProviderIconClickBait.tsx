import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { openWindow, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
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
import { browserName, browserVersion } from 'react-device-detect'

const isOpera = browserName === 'Opera'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onClick,
    onSubmit,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const providerType = provider.type as ProviderType
    const networkType = network.type as NetworkType

    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (!ev.result) return
            if (ev.result?.providerType === providerType && ev.result?.networkType === networkType)
                onSubmit?.(network, provider, ev.result)
        },
    )
    // #endregion

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
                openWindow(downloadLink)
                return
            }
        }

        // it's not necessary to open the connection dialog on popup page.
        // it will switch to the wallet selection page directly.
        if (isPopupPage() && providerType === ProviderType.MaskWallet) {
            onClick?.(network, provider)
            return
        }

        switch (providerType) {
            case ProviderType.MaskWallet:
            case ProviderType.MetaMask:
            case ProviderType.WalletConnect:
            case ProviderType.Coin98:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
            case ProviderType.Fortmatic:
            case ProviderType.Opera:
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

    // hide injected provider on dashboard
    if (isInjectedProvider(providerType) && isDashboardPage()) return null

    if (providerType === ProviderType.Opera && isDashboardPage()) return null

    if (providerType === ProviderType.Opera && !isOpera) return null

    console.log(`${browserName} ${browserVersion}`)

    // hide fortmatic for some networks because of incomplete supporting
    if (providerType === ProviderType.Fortmatic && !isFortmaticSupported(getChainIdFromNetworkType(networkType)))
        return null

    // hide coin98
    if (providerType === ProviderType.Coin98) return null

    // hide fortmatic on dashboard
    if (providerType === ProviderType.Fortmatic && isDashboardPage()) return null

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
