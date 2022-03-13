import { useEffect, useCallback } from 'react'
import { useMount } from 'react-use'
import type { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useChainId, useProviderType } from '@masknet/plugin-infra'
import { EVM_Messages } from '../../messages'
import Services from '../../../../extension/service'
import { useProvider } from '../../hooks'

export interface ProviderBridgeProps {
    providerType: ProviderType
}

export function ProviderBridge({ providerType: expectedProviderType }: ProviderBridgeProps) {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const actualProviderType = useProviderType<ProviderType>(NetworkPluginID.PLUGIN_EVM)
    const provider = useProvider(expectedProviderType)

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

                const result = await provider?.request({
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
                    error: error instanceof Error ? error : new Error('Failed to send transaction.'),
                })
            }
        })
    }, [expectedProviderType, provider])

    useEffect(() => {
        const onAccountsChanged = async (accounts: string[]) => {
            if (actualProviderType !== expectedProviderType) return
            await Services.Ethereum.notifyEvent(actualProviderType, 'accountsChanged', accounts)
        }

        provider?.on('accountsChanged', onAccountsChanged)
        return () => {
            provider?.removeListener('accountsChanged', onAccountsChanged)
        }
    }, [actualProviderType, expectedProviderType, provider])

    useEffect(() => {
        const onChainChanged = async (chainId: ChainId) => {
            if (actualProviderType !== expectedProviderType) return
            await Services.Ethereum.notifyEvent(actualProviderType, 'chainChanged', chainId)
        }
        provider?.on('chainChanged', onChainChanged)
        return () => {
            provider?.removeListener('chainChanged', onChainChanged)
        }
    }, [actualProviderType, expectedProviderType, provider])

    useEffect(() => {
        const onDisconnect = async () => {
            if (actualProviderType !== expectedProviderType) return
            await Services.Ethereum.notifyEvent(actualProviderType, 'disconnect')
        }
        provider?.on('disconnect', onDisconnect)
        return () => {
            provider?.removeListener('disconnect', onDisconnect)
        }
    }, [actualProviderType, expectedProviderType, provider])

    useMount(onMounted)

    return null
}
