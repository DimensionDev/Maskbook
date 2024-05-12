import { first } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { Emitter } from '@servie/events'
import { delay } from '@masknet/kit'
import {
    ChainId,
    ProviderURL,
    EthereumMethodType,
    type ProviderType,
    type RequestArguments,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { type Account, type Wallet, EMPTY_LIST, createConstantSubscription } from '@masknet/shared-base'
import { EVMChainResolver } from '../apis/ResolverAPI.js'
import { createWeb3ProviderFromRequest } from '../../../helpers/createWeb3ProviderFromRequest.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { EVMWalletProvider } from './index.js'

export abstract class BaseEVMWalletProvider implements EVMWalletProvider {
    constructor(protected providerType: ProviderType) {}

    public emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()

    get subscription() {
        return {
            account: createConstantSubscription(''),
            chainId: createConstantSubscription(ChainId.Mainnet),
            wallets: createConstantSubscription<Wallet[]>(EMPTY_LIST),
        }
    }

    get connected() {
        return false
    }

    /**
     * This field indicates the provider is ready to be set up.
     * Please make sure that the provider SDK or global environment is ready.
     * No need to wait by default
     */
    get ready() {
        return true
    }

    // Switch chain with RPC calls by default
    async switchChain(chainId: ChainId): Promise<void> {
        if (!isValidChainId(chainId)) throw new Error('Invalid chain id.')

        try {
            await this.request({
                method: EthereumMethodType.wallet_switchEthereumChain,
                params: [
                    {
                        chainId: web3_utils.toHex(chainId),
                    },
                ],
            })
        } catch (error) {
            const errorMessage = (error as { message?: string } | undefined)?.message

            // error message if the chain doesn't exist from metamask
            // Unrecognized chain ID "xxx". Try adding the chain using wallet_addEthereumChain first.
            if (
                typeof errorMessage === 'string' &&
                (errorMessage.includes(EthereumMethodType.wallet_addEthereumChain) ||
                    errorMessage.includes('addEthereumChain') ||
                    errorMessage.includes('configured for connector'))
            ) {
                await this.request<void>({
                    method: EthereumMethodType.wallet_addEthereumChain,
                    params: [
                        {
                            chainId: web3_utils.toHex(chainId),
                            chainName: EVMChainResolver.chainFullName(chainId) ?? EVMChainResolver.chainName(chainId),
                            nativeCurrency: EVMChainResolver.nativeCurrency(chainId),
                            rpcUrls: [ProviderURL.fromOfficial(chainId)],
                            blockExplorerUrls: [EVMChainResolver.explorerUrl(chainId)?.url],
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
            method: EthereumMethodType.eth_chainId,
            params: [],
        })

        if (Number.parseInt(actualChainId, 16) !== chainId)
            throw new Error(`Failed to switch to ${EVMChainResolver.chainFullName(chainId)}.`)
    }

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    abstract request<T>(requestArguments: RequestArguments, options?: WalletAPI.ProviderOptions<ChainId>): Promise<T>

    // Create an external provider from the basic request method.
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>) {
        return createWeb3ProviderFromRequest((requestArguments: RequestArguments) =>
            this.request(requestArguments, options),
        )
    }

    async connect(expectedChainId: ChainId, address?: string): Promise<Account<ChainId>> {
        const accounts = await this.request<string[]>({
            method: EthereumMethodType.eth_requestAccounts,
            params: [],
        })
        const chainId = await this.request<string>({
            method: EthereumMethodType.eth_chainId,
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
