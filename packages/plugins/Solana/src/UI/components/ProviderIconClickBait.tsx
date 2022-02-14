import { bridgedSolanaProvider } from '@masknet/injected-script'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { isDashboardPage } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-solana'
import { cloneElement, isValidElement, useCallback } from 'react'
import { getStorage } from '../../storage'
import { hexToBase58 } from '../../utils'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        const rsp = await bridgedSolanaProvider.connect()
        if (rsp?.publicKey) {
            const base58Key = hexToBase58(rsp.publicKey._bn)
            const storage = getStorage()
            await storage.publicKey.setValue(base58Key)
            await storage.network.setValue(network.chainId)
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
