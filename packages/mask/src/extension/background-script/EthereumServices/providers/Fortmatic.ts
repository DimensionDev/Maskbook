import type { RequestArguments } from 'web3-core'
import { defer } from '@dimensiondev/kit'
import { ChainId, EthereumMethodType } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../../../plugins/EVM/messages'
import { resetAccount } from '../../../../plugins/Wallet/services'
import { BaseProvider } from './Base'
import type { Provider } from '../types'

export class FortmaticProvider extends BaseProvider implements Provider {
    private id = 0

    override async request<T>(requestArguments: RequestArguments) {
        const requestId = this.id++
        const [deferred, resolve, reject] = defer<T, Error | null>()

        function onResponse({ payload, result, error }: EVM_Messages['FORTMATIC_PROVIDER_RPC_RESPONSE']) {
            if (payload.id !== requestId) return
            if (error) reject(error)
            else resolve(result)
        }

        const timer = setTimeout(
            () => reject(new Error('The request is timeout.')),
            requestArguments.method === EthereumMethodType.MASK_LOGIN_FORTMATIC ? 3 * 60 * 1000 : 45 * 1000,
        )
        EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.on(onResponse)
        EVM_Messages.events.FORTMATIC_PROVIDER_RPC_REQUEST.sendToVisiblePages({
            payload: {
                jsonrpc: '2.0',
                id: requestId,
                params: [],
                ...requestArguments,
            },
        })

        deferred.finally(() => {
            clearTimeout(timer)
            EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.off(onResponse)
        })

        return deferred
    }

    async requestAccounts(chainId = ChainId.Mainnet) {
        const provider = await this.createExternalProvider()
        return provider.request<{
            chainId: ChainId
            accounts: string[]
        }>({
            method: EthereumMethodType.MASK_LOGIN_FORTMATIC,
            params: [chainId],
        })
    }

    async dismissAccounts(chainId = ChainId.Mainnet) {
        const provider = await this.createExternalProvider()
        await provider.request({
            method: EthereumMethodType.MASK_LOGOUT_FORTMATIC,
            params: [chainId],
        })
        await resetAccount()
    }
}
