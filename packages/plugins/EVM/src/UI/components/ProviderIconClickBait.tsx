import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { openWindow, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, NetworkType, ProviderType, resolveProviderDownloadLink } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../messages'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onClick,
    onSubmit,
}: Web3Plugin.UI.ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>) {
    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        EVM_Messages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (ev.result) onSubmit?.(network, provider)
        },
    )
    // #endregion

    const providerType = provider.type
    const networkType = network.type

    const onClickProvider = useCallback(async () => {
        const
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

        setConnectWalletDialog({
            open: true,
            providerType,
            networkType,
        })
        onClick?.(network, provider)
    }, [network, provider, onClick])

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
