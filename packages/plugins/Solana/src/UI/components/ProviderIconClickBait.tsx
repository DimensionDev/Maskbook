import { bridgedSolanaProvider } from '@masknet/injected-script'
import type { Web3Plugin } from '@masknet/plugin-infra'
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
            await getStorage().publicKey.setValue(base58Key)
            onSubmit?.(network, provider)
        }
    }, [provider, onClick, onSubmit])

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      ...children.props,
                      ...{
                          onClick: onLogIn,
                      },
                  })
                : children}
        </>
    )
}
