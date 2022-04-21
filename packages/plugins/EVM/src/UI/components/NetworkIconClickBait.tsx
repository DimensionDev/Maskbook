import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../messages'

export function NetworkIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>) {
    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        EVM_Messages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (ev.result) onSubmit?.(network, provider)
        },
    )
    // #endregion

    const providerType = provider?.type
    const networkType = network.type

    const onClickNetwork = useCallback(async () => {
        if (!providerType) return
        setConnectWalletDialog({
            open: true,
            providerType,
            networkType,
        })
        onClick?.(network, provider)
    }, [network, provider, onClick])

    if (!providerType) return null

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
