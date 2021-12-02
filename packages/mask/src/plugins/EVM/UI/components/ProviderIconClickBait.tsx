import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { useRemoteControlledDialog } from '@masknet/shared'
import {
    isInjectedProvider,
    NetworkType,
    ProviderType,
    resolveProviderDownloadLink,
    useWallets,
} from '@masknet/web3-shared-evm'
import { WalletMessages } from '../../../Wallet/messages'
import { useInjectedProviderReady, useInjectedProviderType } from '../../hooks'

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

    const wallets = useWallets(ProviderType.MaskWallet)
    const injectedProviderType = useInjectedProviderType()
    const injectedProviderReady = useInjectedProviderReady()

    const onClickProvider = useCallback(async () => {
        // open the download page
        if (isInjectedProvider(providerType)) {
            if (!injectedProviderReady || providerType !== injectedProviderType) {
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
    }, [network, provider, wallets, injectedProviderReady, injectedProviderType, onClick])

    // temporary hide inject providers
    if (isInjectedProvider(providerType)) return null

    // hide injected provider in dashboard
    if (isInjectedProvider(providerType) && location.href.includes('dashboard.html')) return null

    // hide fortmatic on non-mainnet networks
    if (providerType === ProviderType.Fortmatic && networkType !== NetworkType.Ethereum) return null

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
