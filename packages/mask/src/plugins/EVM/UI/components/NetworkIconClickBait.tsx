import { useCallback, cloneElement, isValidElement } from 'react'
import { unreachable } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { CrossIsolationMessages } from '@masknet/shared-base'
import {
    resolveChainIdFromNetworkType,
    isFortmaticSupported,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared-evm'

export function NetworkIconClickBait({
    network,
    provider,
    children,
    onClick,
    onSubmit,
}: Web3Plugin.UI.NetworkIconClickBaitProps) {
    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (ev.result?.providerType === providerType && ev.result?.networkType === networkType)
                onSubmit?.(network, provider, ev.result)
        },
    )
    // #endregion

    const providerType = provider?.type as ProviderType | undefined
    const networkPluginId = provider?.providerAdaptorPluginID
    const networkType = network.type as NetworkType

    const onClickNetwork = useCallback(async () => {
        if (!providerType || !networkPluginId) return

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
                    networkPluginId,
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
    if (providerType === ProviderType.Fortmatic && !isFortmaticSupported(resolveChainIdFromNetworkType(networkType)))
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
