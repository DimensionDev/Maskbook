import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { NetworkType, ProviderType, useFCL } from '@masknet/web3-shared-flow'

export interface ProviderIconClickBaitProps {
    network: Web3Plugin.NetworkDescriptor
    provider: Web3Plugin.ProviderDescriptor
    children?: React.ReactNode
    onClick?: () => void
}

export function ProviderIconClickBait({ network, provider, children, onClick }: ProviderIconClickBaitProps) {
    const networkType = network.type as NetworkType
    const providerType = network.type as ProviderType

    const fcl = useFCL()
    const onLogIn = useCallback(() => fcl.logIn(), [fcl])
    const onClickProvider = useCallback(() => {
        onLogIn()
        onClick?.()
    }, [networkType, providerType, onLogIn, onClick])

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
