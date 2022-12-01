import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { delay } from '@masknet/kit'
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
} from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'

export class BaseProvider implements EVM_Provider {
    // private nameStorageObject?: StorageObject<{ names: Record<string, string> }>

    constructor(protected providerType: ProviderType) {}

    emitter = new Emitter<ProviderEvents<ChainId, ProviderType>>()

    // get nameStorage() {
    //     if (this.nameStorageObject) return this.nameStorageObject
    //     const { storage } = SharedContextSettings.value
    //         .createKVStorage('persistent', {})
    //         .createSubScope(`${this.providerType}_names`, { names: {} })

    //     this.nameStorageObject = storage
    //     return this.nameStorageObject
    // }

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    async switchAccount(account?: string | undefined): Promise<void> {
        throw new Error('Method not implemented.')
    }

    // Switch chain with RPC calls by default
    async switchChain(chainId?: ChainId): Promise<void> {
        if (!chainId) throw new Error('Unknown chain id.')

        try {
            await this.request({
                method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: toHex(chainId),
                    },
                ],
            })
        } catch (error) {
            const errorMessage = (error as { message?: string } | undefined)?.message

            // error message if the chain doesn't exist from metamask
            // Unrecognized chain ID "xxx". Try adding the chain using wallet_addEthereumChain first.
            if (
                typeof errorMessage === 'string' &&
                errorMessage?.includes(EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN)
            ) {
                await this.request<void>({
                    method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
                    params: [
                        {
                            chainId: toHex(chainId),
                            chainName: chainResolver.chainFullName(chainId) ?? chainResolver.chainName(chainId),
                            nativeCurrency: chainResolver.nativeCurrency(chainId),
                            rpcUrls: getRPCConstants(chainId).RPC_URLS_OFFICIAL ?? [],
                            blockExplorerUrls: [chainResolver.explorerURL(chainId)?.url],
                        },
                    ],
                })
            } else {
                throw error
            }
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

    async connect(expectedChainId: ChainId): Promise<Account<ChainId>> {
        const accounts = await this.request<string[]>({
            method: EthereumMethodType.ETH_REQUEST_ACCOUNTS,
            params: [],
        })
        const chainId = await this.request<string>({
            method: EthereumMethodType.ETH_CHAIN_ID,
            params: [],
        })

        const actualChainId = Number.parseInt(chainId, 16)
        if (expectedChainId !== actualChainId) throw new Error(`Failed to connect to ${this.providerType}`)

        return {
            chainId: actualChainId,
            account: first(accounts) ?? '',
        }
    }

    async disconnect(): Promise<void> {
        // do nothing by default
    }
}
