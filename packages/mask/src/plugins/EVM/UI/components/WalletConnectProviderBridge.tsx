import { useCallback, useEffect } from 'react'
import { useMount } from 'react-use'
import { first } from 'lodash-unified'
import { getEnumAsArray } from '@dimensiondev/kit'
import SDK from '@walletconnect/web3-provider'
import { ChainId, getRPCConstants, ProviderType } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useProviderType, useChainId } from '@masknet/plugin-infra'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import { WalletRPC } from '../../../Wallet/messages'
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
        if (!isContextMatched || providerType !== ProviderType.WalletConnect) return
        const connected = await Services.Ethereum.connect({
            providerType,
        })
        await WalletRPC.updateAccount({
            account: connected.account,
            chainId: connected.chainId,
            providerType,
        })
    }, [chainId, providerType])

    useEffect(() => {
        return EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            console.log('DEBUG: WALLET_CONNECT_PROVIDER_RPC_REQUEST')
            console.log({
                payload,
            })

            if (!isContextMatched) return
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
                EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    error: error instanceof Error ? error : new Error(),
                })
            }
        })
    }, [])

    useEffect(() => {
        return provider.on('accountsChanged', async (accounts: string[]) => {
            if (!isContextMatched) return
            await Services.Ethereum.notifyEvent(providerType, 'accountsChanged', accounts)
        })
    }, [providerType])

    useEffect(() => {
        return provider.on('chainChanged', async (chainId: ChainId) => {
            if (!isContextMatched) return
            await Services.Ethereum.notifyEvent(providerType, 'chainChanged', chainId)
        })
    }, [providerType])

    useEffect(() => {
        return provider.on('disconnect', async () => {
            if (!isContextMatched) return
            await Services.Ethereum.notifyEvent(providerType, 'disconnect')
        })
    }, [providerType])

    useMount(onMounted)

    return null
}
