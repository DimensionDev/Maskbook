import { useCallback, cloneElement, isValidElement } from 'react'
import type { Plugin } from '@masknet/plugin-infra/src'
import { NetworkType, ProviderType, useFCL } from '@masknet/web3-shared-flow'

export interface ProviderIconClickBaitProps {
    network: Plugin.Shared.Network
    provider: Plugin.Shared.Provider
    children?: React.ReactNode
}

export function ProviderIconClickBait({ network, provider, children }: ProviderIconClickBaitProps) {
    const networkType = network.type as NetworkType
    const providerType = network.type as ProviderType

    const fcl = useFCL()
    const onLogIn = useCallback(() => fcl.logIn(), [fcl])
    const onClick = useCallback(() => {
        onLogIn()
    }, [networkType, providerType, onLogIn])

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
