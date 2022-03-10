import { useEffect, useCallback } from 'react'
import { useMount } from 'react-use'
import { noop } from 'lodash-unified'
import type { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useChainId, useProviderType } from '@masknet/plugin-infra'
import { EVM_Messages } from '../../messages'
import Services from '../../../../extension/service'
import { useBridgedProvider } from '../../hooks'

export interface ProviderBridgeProps {
    providerType: ProviderType
}

export function ProviderBridge({ providerType: expectedProviderType }: ProviderBridgeProps) {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const actualProviderType = useProviderType<ProviderType>(NetworkPluginID.PLUGIN_EVM)
    const bridgedProvider = useBridgedProvider(expectedProviderType)

    const onMounted = useCallback(async () => {
        if (expectedProviderType !== actualProviderType) return
        await Services.Ethereum.connect({
            providerType: actualProviderType,
        })
    }, [chainId, actualProviderType, expectedProviderType])

    useEffect(() => {
        return EVM_Messages.events.PROVIDER_RPC_REQUEST.on(async ({ providerType, payload }) => {
            if (expectedProviderType !== providerType) return
            try {
                console.log('DEBUG: PROVIDER_RPC_RESPONSE request')
                console.log({
                    providerType,
                    payload,
                })

                const result = await bridgedProvider?.request({
                    method: payload.method,
                    params: payload.params,
                })

                EVM_Messages.events.PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    providerType: expectedProviderType,
                    payload,
                    result,
                    error: null,
                })
            } catch (error) {
                console.log('DEBUG: PROVIDER_RPC_RESPONSE error')
                console.log({
                    error,
                })

                EVM_Messages.events.PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    providerType: expectedProviderType,
                    payload,
                    error: error instanceof Error ? error : new Error('Failed to send transction.'),
                })
            }
        })
    }, [expectedProviderType, bridgedProvider])

    useEffect(() => {
        return (
            bridgedProvider?.on('accountsChanged', async (accounts: string[]) => {
                if (actualProviderType !== expectedProviderType) return
                await Services.Ethereum.notifyEvent(actualProviderType, 'accountsChanged', accounts)
            }) ?? noop
        )
    }, [actualProviderType, expectedProviderType, bridgedProvider])

    useEffect(() => {
        return (
            bridgedProvider?.on('chainChanged', async (chainId: ChainId) => {
                if (actualProviderType !== expectedProviderType) return
                await Services.Ethereum.notifyEvent(actualProviderType, 'chainChanged', chainId)
            }) ?? noop
        )
    }, [actualProviderType, expectedProviderType, bridgedProvider])

    useEffect(() => {
        return (
            bridgedProvider?.on('disconnect', async () => {
                if (actualProviderType !== expectedProviderType) return
                await Services.Ethereum.notifyEvent(actualProviderType, 'disconnect')
            }) ?? noop
        )
    }, [actualProviderType, expectedProviderType, bridgedProvider])

    useMount(onMounted)

    return null
}
