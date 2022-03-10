import { useCallback, useEffect } from 'react'
import { useMount } from 'react-use'
import { first } from 'lodash-unified'
import { getEnumAsArray } from '@dimensiondev/kit'
import SDK from '@walletconnect/web3-provider'
import { ChainId, getRPCConstants, ProviderType } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useProviderType, useChainId } from '@masknet/plugin-infra'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import Services from '../../../../extension/service'
import { EVM_Messages } from '../../messages'

const provider = new SDK({
    rpc: getEnumAsArray(ChainId).reduce<Record<number, string>>((accumulator, item) => {
        const rpc = first(getRPCConstants(item.value).RPC)
        if (rpc) {
            accumulator[item.value] = rpc
        }
        return accumulator
    }, {}),
})

const isContextMatched = !isDashboardPage() && !isPopupPage()

export interface WalletConnectProviderBridgeProps {}

export function WalletConnectProviderBridge(props: WalletConnectProviderBridgeProps) {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType<ProviderType>(NetworkPluginID.PLUGIN_EVM)

    const onMounted = useCallback(async () => {
        if (!isContextMatched || providerType !== ProviderType.WalletConnect || provider.connected) return
        await Services.Ethereum.connect(providerType)
    }, [chainId, providerType])

    useEffect(() => {
        return EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            if (!isContextMatched) return
            if (!provider.connected) await provider.enable()
            try {
                const result = await provider.request({
                    method: payload.method,
                    params: payload.params,
                })
                EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    result,
                    error: null,
                })
            } catch (error) {
                console.log('DEBUG: WALLET_CONNECT_PROVIDER_RPC_REQUEST error')
                console.log({
                    error,
                })

                EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    error:
                        error instanceof Error
                            ? error
                            : new Error(
                                  (error as { message?: string } | undefined)?.message || 'Failed to send transction.',
                              ),
                })
            }
        })
    }, [])

    useEffect(() => {
        const callback = async (accounts: string[]) => {
            if (!isContextMatched) return
            await Services.Ethereum.notifyEvent(providerType, 'accountsChanged', accounts)
        }
        provider.on('accountsChanged', callback)
        return () => {
            provider.off('accountsChanged', callback)
        }
    }, [providerType])

    useEffect(() => {
        const callback = async (chainId: ChainId) => {
            if (!isContextMatched) return
            await Services.Ethereum.notifyEvent(providerType, 'chainChanged', chainId)
        }
        provider.on('chainChanged', callback)
        return () => {
            provider.off('chainChanged', callback)
        }
    }, [providerType])

    useEffect(() => {
        const callback = async () => {
            if (!isContextMatched) return
            await Services.Ethereum.notifyEvent(providerType, 'disconnect')
        }
        provider.on('disconnect', callback)
        return () => {
            provider.off('disconnect', callback)
        }
    }, [providerType])

    useMount(onMounted)

    return null
}
