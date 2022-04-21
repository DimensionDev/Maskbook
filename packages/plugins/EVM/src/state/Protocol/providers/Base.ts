import Web3 from 'web3'
import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { Emitter } from '@servie/events'
import { ChainId, createEIP1193Provider, EthereumMethodType, getChainDetailedCAIP } from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { EVM_Provider } from '../types'

export class BaseProvider implements EVM_Provider {
    emitter = new Emitter<Web3Plugin.ProviderEvents<ChainId>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    // Switch chain by RPC calls by default
    switchChain(chainId?: ChainId): Promise<void> {
        if (chainId === ChainId.Mainnet) {
            return this.request({
                method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: toHex(chainId),
                    },
                ],
            })
        } else {
            const chainDetailed = getChainDetailedCAIP(chainId)
            return this.request<void>({
                method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
                params: [chainDetailed].filter(Boolean),
            })
        }
    }

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        throw new Error('Method not implemented.')
    }

    // Create a web3 instance from the external provider by default.
    async createWeb3(chainId?: ChainId) {
        // @ts-ignore
        return new Web3(await this.createWeb3Provider(chainId))
    }

    // Create an external provider from the basic request method.
    async createWeb3Provider(chainId?: ChainId) {
        await this.readyPromise
        return createEIP1193Provider(this.request.bind(this))
    }

    connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        throw new Error('Method not implemented')
    }

    disconnect(): Promise<void> {
        throw new Error('Method not implemented')
    }
}
