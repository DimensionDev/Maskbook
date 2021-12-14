import { useEffect } from 'react'
import { bridgedEthereumProvider, bridgedCoin98Provider } from '@masknet/injected-script'
import { useValueRef } from '@masknet/shared'
import { isInjectedProvider } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../messages'
import { currentProviderSettings } from '../../../Wallet/settings'
import Services from '../../../../extension/service'

export interface InjectedProviderBridgeProps {
    type: 'ethereum' | 'coin98'
}

export function InjectedProviderBridge(props: InjectedProviderBridgeProps) {
    const providerType = useValueRef(currentProviderSettings)
    const bridgedProvider = props.type === 'ethereum' ? bridgedEthereumProvider : bridgedCoin98Provider

    useEffect(() => {
        return EVM_Messages.events.INJECTED_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            try {
                const result = await bridgedProvider.request({
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
    }, [bridgedProvider])

    useEffect(() => {
        return bridgedProvider.on('accountsChanged', async (event) => {
            if (!isInjectedProvider(providerType)) return
            Services.Ethereum.notifyInjectedEvent('accountsChanged', event, providerType)
        })
    }, [providerType, bridgedProvider])

    useEffect(() => {
        return bridgedProvider.on('chainChanged', (event) => {
            if (!isInjectedProvider(providerType)) return
            Services.Ethereum.notifyInjectedEvent('chainChanged', event, providerType)
        })
    }, [providerType, bridgedProvider])

    return null
}
