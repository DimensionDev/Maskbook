import Web3 from 'web3'
import type { HttpProvider, RequestArguments } from 'web3-core'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { ChainId, createExternalProvider, createPayload, getChainRPC, getRPCConstants } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { Provider, ProviderOptions, Web3Options } from '../types'
import { currentChainIdSettings } from '../../../../plugins/Wallet/settings'

const WEIGHTS_LENGTH = getRPCConstants(ChainId.Mainnet).RPC_WEIGHTS?.length ?? 4

export class MaskWalletProvider extends BaseProvider implements Provider {
    private id = 0
    private seed = Math.floor(Math.random() * WEIGHTS_LENGTH)
    private providerPool = new Map<string, HttpProvider>()
    private instancePool = new Map<string, Web3>()

    private createWeb3Instance(provider: HttpProvider) {
        const instance = this.instancePool.get(provider.host)
        if (instance) return instance

        const newInstance = new Web3(provider)
        this.instancePool.set(provider.host, newInstance)
        return newInstance
    }

    private createProviderInstance(url: string) {
        const instance = this.providerPool.get(url)
        if (instance) return instance

        const newInstance = new Web3.providers.HttpProvider(url, {
            timeout: 30 * 1000, // ms
            // @ts-ignore
            clientConfig: {
                keepalive: true,
                keepaliveInterval: 1, // ms
            },
            reconnect: {
                auto: true,
                delay: 5000, // ms
                maxAttempts: Number.MAX_SAFE_INTEGER,
                onTimeout: true,
            },
        })
        this.providerPool.set(url, newInstance)
        return newInstance
    }

    override async createWeb3({ keys = [], options = {} }: Web3Options = {}) {
        const provider = await this.createProvider(options)
        const web3 = this.createWeb3Instance(provider)
        if (keys.length) {
            web3.eth.accounts.wallet.clear()
            keys.forEach((k) => k && k !== '0x' && web3.eth.accounts.wallet.add(k))
        }
        return web3
    }

    async createProvider({ chainId, url }: ProviderOptions = {}) {
        url = url ?? getChainRPC(chainId ?? currentChainIdSettings.value, this.seed)
        if (!url) throw new Error('Failed to create provider.')
        return this.createProviderInstance(url)
    }

    override async createExternalProvider(options?: ProviderOptions) {
        const provider = await this.createProvider(options)
        const request = <T extends unknown>(requestArguments: RequestArguments) => {
            return new Promise<T>((resolve, reject) => {
                this.id += 1
                const requestId = this.id
                provider?.send(
                    createPayload(requestId, requestArguments.method, requestArguments.params),
                    (error: Error | null, response?: JsonRpcResponse) => {
                        if (error) reject(error)
                        else resolve(response?.result as T)
                    },
                )
            })
        }
        return createExternalProvider(request)
    }
}
