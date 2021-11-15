import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra/src'
import { PopupRoutes } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared'
import { getChainIdFromNetworkType, NetworkType, ProviderType, useWallets } from '@masknet/web3-shared-evm'
import Services from '../../../../extension/service'
import { WalletMessages } from '../../../Wallet/messages'

export interface ProviderIconClickBaitProps {
    network: Web3Plugin.NetworkDescriptor
    provider: Web3Plugin.ProviderDescriptor
    children?: React.ReactNode
}

export function ProviderIconClickBait({ network, provider, children }: ProviderIconClickBaitProps) {
    //#region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    //#endregion

    const providerType = provider.type as ProviderType
    const networkType = network.type as NetworkType
    const wallets = useWallets(ProviderType.MaskWallet)

    const onClick = useCallback(async () => {
        switch (providerType) {
            case ProviderType.MaskWallet:
                await Services.Helper.openPopupWindow(wallets.length > 0 ? PopupRoutes.SelectWallet : undefined, {
                    chainId: getChainIdFromNetworkType(network.type as NetworkType),
                })
                break
            case ProviderType.MetaMask:
            case ProviderType.WalletConnect:
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
    }, [networkType, providerType, wallets])

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      ...children.props,
                      ...{
                          onClick,
                      },
                  })
                : children}
        </>
    )
}
