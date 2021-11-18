import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { useFCL } from '@masknet/web3-shared-flow'
import { getStorage } from '../../storage'

export interface ProviderIconClickBaitProps {
    network: Web3Plugin.NetworkDescriptor
    provider: Web3Plugin.ProviderDescriptor
    children?: React.ReactNode
    onClick?: () => void
}

export function ProviderIconClickBait({ network, provider, children, onClick }: ProviderIconClickBaitProps) {
    const fcl = useFCL()

    const onLogIn = useCallback(async () => {
        const user = await fcl.logIn()

        if (user?.addr) {
            await getStorage().user.setValue(user)
            onClick?.()
        }
    }, [fcl])

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
