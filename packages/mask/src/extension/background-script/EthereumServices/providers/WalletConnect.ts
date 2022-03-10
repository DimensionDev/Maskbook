import { first } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import { defer } from '@dimensiondev/kit'
import { EthereumMethodType, ProviderType, ChainId } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { Provider } from '../types'
import { EVM_Messages } from '../../../../plugins/EVM/messages'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'
import { WalletRPC } from '../../../../plugins/Wallet/messages'

export class WalletConnectProvider extends BaseProvider implements Provider {
    private id = 0

    // public async signPersonalMessage(data: string, address: string, password: string) {
    //     if (!this.connector) throw new Error('Connection Lost.')
    //     return (await this.connector.signPersonalMessage([data, address, password])) as string
    // }

    // public async sendCustomRequest(payload: IJsonRpcRequest) {
    //     if (!this.connector) throw new Error('Connection Lost.')
    //     return (await this.connector.sendCustomRequest(payload as IJsonRpcRequest)) as JsonRpcResponse
    // }

    // public async signTypedDataMessage(data: string, address: string) {
    //     if (!this.connector) throw new Error('Connection Lost.')
    //     return (await this.connector.signTypedData([data, address])) as string
    // }

    override async request<T extends unknown>(requestArguments: RequestArguments) {
        const requestId = this.id++
        const [deferred, resolve, reject] = defer<T, Error | null>()

        const onResponse = ({ payload, result, error }: EVM_Messages['WALLET_CONNECT_PROVIDER_RPC_RESPONSE']) => {
            if (payload.id !== requestId) return
            if (error) reject(error)
            else resolve(result as T)
        }

        const timer = setTimeout(
            () => {
                reject(new Error('The request is timeout.'))
            },
            requestArguments.method === EthereumMethodType.ETH_REQUEST_ACCOUNTS ? 3 * 60 * 1000 : 45 * 1000,
        )

        deferred.finally(() => {
            clearTimeout(timer)
            EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_RESPONSE.off(onResponse)
        })

        EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_RESPONSE.on(onResponse)
        EVM_Messages.events.WALLET_CONNECT_PROVIDER_RPC_REQUEST.sendToVisiblePages({
            payload: {
                jsonrpc: '2.0',
                id: requestId,
                params: [],
                ...requestArguments,
            },
        })

        return deferred
    }

    async onAccountsChanged(accounts: string[]) {
        if (currentProviderSettings.value !== ProviderType.WalletConnect) return
        await WalletRPC.updateAccount({
            account: first(accounts),
            providerType: ProviderType.WalletConnect,
        })
    }

    async onChainIdChanged(id: string) {
        if (currentProviderSettings.value !== ProviderType.WalletConnect) return

        // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
        const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
        if (currentChainIdSettings.value === chainId) return
        await WalletRPC.updateAccount({
            chainId,
        })
    }
}
