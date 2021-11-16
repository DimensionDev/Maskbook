import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { useRemoteControlledDialog } from '@masknet/shared'
import { NetworkType, ProviderType, resolveProviderDownloadLink, useWallets } from '@masknet/web3-shared-evm'
import { WalletMessages } from '../../../Wallet/messages'
import { useInjectedProviderReady, useInjectedProviderType } from '../../hooks'

export interface ProviderIconClickBaitProps {
    network: Web3Plugin.NetworkDescriptor
    provider: Web3Plugin.ProviderDescriptor
    children?: React.ReactNode
    onClick?: () => void
}

export function ProviderIconClickBait({ network, provider, children, onClick }: ProviderIconClickBaitProps) {
    //#region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    //#endregion

    const providerType = provider.type as ProviderType
    const networkType = network.type as NetworkType

    const wallets = useWallets(ProviderType.MaskWallet)
    const injectedProviderType = useInjectedProviderType()
    const injectedProviderReady = useInjectedProviderReady()

    const onClickProvider = useCallback(async () => {
        // open the download page
        if (
            [ProviderType.MetaMask, ProviderType.Coin98, ProviderType.WalletLink, ProviderType.MathWallet].includes(
                providerType,
            )
        ) {
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

        onClick?.()
    }, [networkType, providerType, wallets, injectedProviderReady, injectedProviderType, onClick])

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
