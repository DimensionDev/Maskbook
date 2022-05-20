import Web3 from 'web3'
import { toHex } from 'web3-utils'
import type { HttpProvider, RequestArguments } from 'web3-core'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { ChainId, createWeb3Provider, createPayload, getRPCConstants, chainResolver } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { EVM_Provider } from '../types'
import { SharedContextSettings, Web3StateSettings } from '../../../settings'

const { RPC_WEIGHTS = [] } = getRPCConstants(ChainId.Mainnet)

export class MaskWalletProvider extends BaseProvider implements EVM_Provider {
    private id = 0
    private seed = Math.floor(Math.random() * RPC_WEIGHTS.length)
    private providerPool = new Map<string, HttpProvider>()
    private instancePool = new Map<string, Web3>()

    constructor() {
        super()
        Web3StateSettings.readyPromise.then(this.addShareContextListeners.bind(this))
    }

    /**
     * Block by the share context
     * @returns
     */
    override get ready() {
        return Web3StateSettings.ready
    }

    /**
     * Block by the share context
     * @returns
     */
    override get readyPromise() {
        return Web3StateSettings.readyPromise.then(() => {})
    }

    override async switchChain(chainId?: ChainId) {
        await SharedContextSettings.value.updateAccount({
            chainId,
        })
    }

    private addShareContextListeners() {
        const sharedContext = SharedContextSettings.value

        sharedContext.chainId.subscribe(() => {
            console.log(this)
            this.emitter.emit('chainId', toHex(sharedContext.chainId.getCurrentValue()))
        })
        sharedContext.account.subscribe(() => {
            this.emitter.emit('accounts', [sharedContext.account.getCurrentValue()])
        })
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

    private async createProvider(chainId = ChainId.Mainnet) {
        await this.readyPromise

        const { RPC_URLS = [], RPC_WEIGHTS = [] } = getRPCConstants(chainId)
        const url = RPC_URLS[RPC_WEIGHTS[this.seed]]
        if (!url) throw new Error('Failed to create provider.')
        return this.createProviderInstance(url)
    }

    private createWeb3Instance(provider: HttpProvider) {
        const instance = this.instancePool.get(provider.host)
        if (instance) return instance

        const newInstance = new Web3(provider)
        this.instancePool.set(provider.host, newInstance)
        return newInstance
    }

    override async createWeb3(chainId?: ChainId) {
        return this.createWeb3Instance(await this.createProvider(chainId))
    }

    override async createWeb3Provider(chainId?: ChainId) {
        const provider = await this.createProvider(chainId)
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
        return createWeb3Provider(request)
    }

    override async connect(chainId: ChainId) {
        const { account, chainId: actualChainId, updateAccount } = SharedContextSettings.value

        if (!account.getCurrentValue()) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)

        // switch chain
        if (actualChainId.getCurrentValue() !== chainId) {
            await updateAccount({
                chainId,
            })
        }

        return {
            chainId,
            account: account.getCurrentValue(),
        }
    }

    override async disconnect() {
        // do nothing
    }
}
