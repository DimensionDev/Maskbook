import { useEffect, useCallback } from 'react'
import { useMount } from 'react-use'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import { ProviderType, isInjectedProvider, ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useChainId, useProviderType } from '@masknet/plugin-infra'
import { EVM_Messages } from '../../messages'
import Services from '../../../../extension/service'
import { WalletRPC } from '../../../Wallet/messages'

export interface InjectedProviderBridgeProps {}

export function InjectedProviderBridge(props: InjectedProviderBridgeProps) {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType<ProviderType>(NetworkPluginID.PLUGIN_EVM)

    const onMounted = useCallback(async () => {
        if (providerType !== ProviderType.Coin98) return
        const connected = await Services.Ethereum.connectInjected()
        await WalletRPC.updateAccount({
            account: connected.account,
            chainId: connected.chainId,
            providerType,
        })
    }, [chainId, providerType])

    useEffect(() => {
        return EVM_Messages.events.INJECTED_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            try {
                const result = await bridgedEthereumProvider.request({
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

    useMount(onMounted)

    return null
}
