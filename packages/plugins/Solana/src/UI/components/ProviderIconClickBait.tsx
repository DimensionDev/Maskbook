import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        console.log('login')
    }, [network, provider, onClick, onSubmit])

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
