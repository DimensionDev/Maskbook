import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { isDashboardPage } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-solana'
import { cloneElement, isValidElement, useCallback } from 'react'
import { connectWallet } from '../../wallet'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        const publicKey = await connectWallet()
        if (publicKey) {
            onSubmit?.(network, provider)
        }
    }, [provider, onClick, onSubmit])

    const isDashboard = isDashboardPage()
    const disabled = isDashboard && provider.type === ProviderType.Phantom
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
                  })
                : children}
        </>
    )
}
