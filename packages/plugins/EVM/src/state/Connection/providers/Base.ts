import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { delay } from '@dimensiondev/kit'
import { Emitter } from '@servie/events'
import type { Account, ProviderEvents, ProviderOptions } from '@masknet/web3-shared-base'
import {
    chainResolver,
    createWeb3,
    createWeb3Provider,
    ChainId,
    ProviderType,
    EthereumMethodType,
    getRPCConstants,
    NetworkType,
} from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'

export class BaseProvider implements EVM_Provider {
    emitter = new Emitter<ProviderEvents<ChainId, ProviderType>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    // Switch chain with RPC calls by default
    async switchChain(chainId?: ChainId): Promise<void> {
        if (chainId && chainResolver.chainNetworkType(chainId) === NetworkType.Ethereum) {
            await this.request({
                method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: toHex(chainId),
                    },
                ],
            })
        } else if (chainId) {
            await this.request<void>({
                method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: toHex(chainId),
                        chainName: chainResolver.chainName(chainId),
                        nativeCurrency: chainResolver.nativeCurrency(chainId),
                        rpcUrls: getRPCConstants(chainId).RPC_URLS ?? [],
                        blockExplorerUrls: [chainResolver.infoURL(chainId)?.url],
                    },
                ],
            })
        } else {
            throw new Error('Unknown chain id.')
        }

        // Delay to make sure the provider will return the newest chain id.
        await delay(1000)

        const actualChainId = await this.request<string>({
            method: EthereumMethodType.ETH_CHAIN_ID,
            params: [],
        })

        if (Number.parseInt(actualChainId, 16) !== chainId)
            throw new Error(`Failed to switch to ${chainResolver.chainFullName(chainId)}.`)
    }

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        throw new Error('Method not implemented.')
    }

    // Create a web3 instance from the external provider by default.
    async createWeb3(options?: ProviderOptions<ChainId>) {
        return createWeb3(await this.createWeb3Provider(options))
    }

    // Create an external provider from the basic request method.
    async createWeb3Provider(options?: ProviderOptions<ChainId>) {
        await this.readyPromise
        return createWeb3Provider((requestArguments: RequestArguments) => this.request(requestArguments, options))
    }

    connect(chainId: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented')
    }

    disconnect(): Promise<void> {
        throw new Error('Method not implemented')
    }
}
