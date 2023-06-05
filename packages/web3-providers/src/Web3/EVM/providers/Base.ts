import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { Emitter } from '@servie/events'
import { delay } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra/content-script'
import {
    chainResolver,
    createWeb3,
    createWeb3Provider,
    ChainId,
    type ProviderType,
    ProviderURL,
    EthereumMethodType,
    type Web3Provider,
    type Web3,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { type Account, type Wallet, EMPTY_LIST, createConstantSubscription } from '@masknet/shared-base'
import { RequestReadonlyAPI } from '../apis/RequestReadonlyAPI.js'
import type { WalletAPI } from '../../../entry-types.js'

export class BaseProvider implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {
    protected context: Plugin.SNSAdaptor.SNSAdaptorContext | undefined

    constructor(protected providerType: ProviderType) {}

    public emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()
    public Request = new RequestReadonlyAPI()

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

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    async setup(context?: Plugin.SNSAdaptor.SNSAdaptorContext): Promise<void> {
        if (context) {
            this.context = context
            return
        }
        throw new Error('Method not implemented.')
    }

    addWallet(wallet: Wallet): Promise<void> {
        throw new Error('Method not implemented.')
    }
    updateWallet(address: string, wallet: Wallet): Promise<void> {
        throw new Error('Method not implemented.')
    }
    updateOrAddWallet(wallet: Wallet): Promise<void> {
        throw new Error('Method not implemented.')
    }
    renameWallet(address: string, name: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    removeWallet(address: string, password?: string | undefined): Promise<void> {
        throw new Error('Method not implemented.')
    }
    updateWallets(wallets: Wallet[]): Promise<void> {
        throw new Error('Method not implemented.')
    }
    removeWallets(wallets: Wallet[]): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async switchAccount(account?: string | undefined): Promise<void> {
        throw new Error('Method not implemented.')
    }

    // Switch chain with RPC calls by default
    async switchChain(chainId: ChainId): Promise<void> {
        if (!isValidChainId(chainId)) throw new Error('Invalid chain id.')

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
                            rpcUrls: [ProviderURL.fromOfficial(chainId)],
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
    async request<T>(requestArguments: RequestArguments, options?: WalletAPI.ProviderOptions<ChainId>): Promise<T> {
        throw new Error('Method not implemented.')
    }

    // Create a web3 instance from the external provider by default.
    createWeb3(options?: WalletAPI.ProviderOptions<ChainId>) {
        return createWeb3(this.createWeb3Provider(options))
    }

    // Create an external provider from the basic request method.
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>) {
        return createWeb3Provider((requestArguments: RequestArguments) => this.request(requestArguments, options))
    }

    async connect(expectedChainId: ChainId, address?: string): Promise<Account<ChainId>> {
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
