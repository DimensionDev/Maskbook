import { useEffect, useCallback } from 'react'
import { useMount } from 'react-use'
import { unreachable } from '@dimensiondev/kit'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import { ProviderType, isInjectedProvider, isFortmaticSupported, ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useChainId, useProviderType } from '@masknet/plugin-infra'
import { EVM_Messages } from '../../messages'
import Services from '../../../../extension/service'
import { WalletRPC } from '../../../Wallet/messages'

export interface InjectedProviderBridgeProps {}

export function InjectedProviderBridge(props: InjectedProviderBridgeProps) {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType<ProviderType>(NetworkPluginID.PLUGIN_EVM)

    const onMounted = useCallback(async () => {
        const updateAccount = (connected: { account?: string; chainId: ChainId }) =>
            WalletRPC.updateAccount({
                account: connected.account,
                chainId: connected.chainId,
                providerType,
            })

        switch (providerType) {
            case ProviderType.MaskWallet:
            case ProviderType.MetaMask:
            case ProviderType.WalletConnect:
            case ProviderType.MathWallet:
            case ProviderType.WalletLink:
                break
            case ProviderType.Fortmatic:
                await updateAccount(
                    await Services.Ethereum.connectFortmatic(isFortmaticSupported(chainId) ? chainId : ChainId.Mainnet),
                )
                break
            case ProviderType.Coin98:
                await updateAccount(await Services.Ethereum.connectInjected())
                break
            case ProviderType.CustomNetwork:
                break
            default:
                unreachable(providerType)
        }
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

    useMount(() => {
        onMounted()
    })

    return null
}
