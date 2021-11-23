import { useCallback, cloneElement, isValidElement } from 'react'
import { NetworkPluginID, useChainId, Web3Plugin } from '@masknet/plugin-infra'
import { useFCL } from '@masknet/web3-shared-flow'
import { getStorage } from '../../storage'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_FLOW)
    const fcl = useFCL(chainId)

    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        const user = await fcl.logIn()

        if (user?.addr) {
            await getStorage().user.setValue(user)
            onSubmit?.(network, provider)
        }
    }, [fcl, network, provider, onClick, onSubmit])

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
