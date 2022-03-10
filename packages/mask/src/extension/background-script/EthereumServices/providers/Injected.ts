import { first } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import { defer } from '@dimensiondev/kit'
import { ChainId, EthereumMethodType, ProviderType } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../../../plugins/EVM/messages'
import { BaseProvider } from './Base'
import type { Provider } from '../types'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'
import { WalletRPC } from '../../../../plugins/Wallet/messages'

export class InjectedProvider extends BaseProvider implements Provider {
    private id = 0

    constructor(private providerType: ProviderType) {
        super()
    }

    override async request<T extends unknown>(requestArguments: RequestArguments) {
        const requestId = this.id++
        const [deferred, resolve, reject] = defer<T, Error | null>()

        const onResponse = ({
            providerType: type,
            payload,
            result,
            error,
        }: EVM_Messages['INJECTED_PROVIDER_RPC_RESPONSE']) => {
            if (type !== this.providerType) return
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
            EVM_Messages.events.INJECTED_PROVIDER_RPC_RESPONSE.off(onResponse)
        })

        EVM_Messages.events.INJECTED_PROVIDER_RPC_RESPONSE.on(onResponse)
        EVM_Messages.events.INJECTED_PROVIDER_RPC_REQUEST.sendToVisiblePages({
            providerType: this.providerType,
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
        if (currentProviderSettings.value !== this.providerType) return
        await WalletRPC.updateAccount({
            account: first(accounts),
            providerType: this.providerType,
        })
    }

    async onChainIdChanged(id: string) {
        if (currentProviderSettings.value !== this.providerType) return

        // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
        const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
        if (currentChainIdSettings.value === chainId) return
        await WalletRPC.updateAccount({
            chainId,
        })
    }
}
