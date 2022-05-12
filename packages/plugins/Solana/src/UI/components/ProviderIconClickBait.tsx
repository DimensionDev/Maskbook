import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { isDashboardPage, CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ProviderType, NetworkType } from '@masknet/web3-shared-solana'
import { cloneElement, isValidElement, useCallback } from 'react'
import { connectWallet } from '../../wallet'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const providerType = provider.type as ProviderType
    const networkType = network.type as NetworkType

    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (!ev.result) return
            if (ev.result?.providerType === providerType && ev.result?.networkType === networkType)
                onSubmit?.(network, provider, ev.result)
        },
    )
    // #endregion

    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        setConnectWalletDialog({
            open: true,
            providerType,
            networkType,
            networkPluginId: provider.providerAdaptorPluginID,
        })
        const publicKey = await connectWallet()
        if (publicKey) {
            onSubmit?.(network, provider)
        }
    }, [provider, onClick, onSubmit])

    const isDashboard = isDashboardPage()
    const disabled = isDashboard && providerType === ProviderType.Phantom
    const disabledStyled = {
        opacity: 0.5,
    }

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      style: disabled ? disabledStyled : undefined,
                      ...children.props,
                      onClick: disabled ? undefined : onLogIn,
                  } as object)
                : children}
        </>
    )
}
