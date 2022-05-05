import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { getChainIdFromNetworkType, isFortmaticSupported, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import { WalletMessages } from '../../../Wallet/messages'

export function NetworkIconClickBait({
    network,
    provider,
    children,
    onClick,
    onSubmit,
}: Web3Plugin.UI.NetworkIconClickBaitProps) {
    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (ev.result?.providerType === providerType && ev.result?.networkType === networkType)
                onSubmit?.(network, provider, ev.result)
        },
    )
    // #endregion

    const providerType = provider?.type as ProviderType | undefined
    const networkType = network.type as NetworkType

    const onClickNetwork = useCallback(async () => {
        if (!providerType) return

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
    }, [network, provider, onClick])

    if (!providerType) return null

    // hide fortmatic for some networks because of incomplete supporting
    if (providerType === ProviderType.Fortmatic && !isFortmaticSupported(getChainIdFromNetworkType(networkType)))
        return null

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      ...children.props,
                      ...{
                          onClick: onClickNetwork,
                      },
                  })
                : children}
        </>
    )
}
