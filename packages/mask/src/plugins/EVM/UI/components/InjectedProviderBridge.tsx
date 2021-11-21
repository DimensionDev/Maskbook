import { useEffect } from 'react'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import { useValueRef } from '@masknet/shared'
import { isInjectedProvider, useWeb3Provider, ProviderType } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../messages'
import { currentProviderSettings } from '../../../Wallet/settings'
import Services from '../../../../extension/service'

export interface InjectedProviderBridgeProps {}

export function InjectedProviderBridge(props: InjectedProviderBridgeProps) {
    const providerType = useValueRef(currentProviderSettings)
    const provider = useWeb3Provider()

    useEffect(() => {
        return EVM_Messages.events.INJECTED_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            try {
                console.log({ payload })
                // scheme 1: fortmatic provider request
                const result =
                    ProviderType.Fortmatic === providerType
                        ? provider.send(payload, () => undefined)
                        : await bridgedEthereumProvider.request({
                              method: payload.method,
                              params: payload.params,
                          })
                EVM_Messages.events.INJECTED_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    result,
                    error: null,
                })
            } catch (error: unknown) {
                EVM_Messages.events.INJECTED_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    error: error instanceof Error ? error : new Error(),
                })
            }
        })
    }, [])

    useEffect(() => {
        return bridgedEthereumProvider.on('accountsChanged', async (event) => {
            if (!isInjectedProvider(providerType)) return
            Services.Ethereum.notifyInjectedEvent('accountsChanged', event, providerType)
        })
    }, [providerType])

    useEffect(() => {
        return bridgedEthereumProvider.on('chainChanged', (event) => {
            if (!isInjectedProvider(providerType)) return
            Services.Ethereum.notifyInjectedEvent('chainChanged', event, providerType)
        })
    }, [providerType])

    return null
}
