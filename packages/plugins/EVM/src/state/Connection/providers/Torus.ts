import { first } from 'lodash-unified'
import { createLookupTableResolver } from '@masknet/web3-shared-base'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import * as Torus from '@toruslabs/torus-embed'
import type { RequestArguments } from 'web3-core'
import type { EVM_Provider } from '../types'
import { BaseProvider } from './Base'

export type ChainIdTorus = ChainId.Mainnet | ChainId.BSC | ChainId.Matic | ChainId.xDai

const getTorusNetworkType = createLookupTableResolver<ChainIdTorus, Torus.ETHEREUM_NETWORK_TYPE>(
    {
        [ChainId.Mainnet]: 'mainnet',
        [ChainId.BSC]: 'bsc_mainnet',
        [ChainId.Matic]: 'matic',
        [ChainId.xDai]: 'xdai',
    },
    'mainnet',
)

const isTorusSupported = (chainId: ChainId): chainId is ChainIdTorus => {
    return [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.xDai].includes(chainId)
}

export default class TorusProvider extends BaseProvider implements EVM_Provider {
    /**
     * If the internal chain id exists, it means the connection was created.
     * Otherwxise, no connection was created before.
     */
    private chainId_: ChainIdTorus | null = null
    private providerPool = new Map<ChainId, Torus.TorusInpageProvider>()

    private get chainId(): ChainIdTorus {
        const chainId = this.chainId_
        if (!chainId) throw new Error('No connection.')
        if (!isTorusSupported(chainId)) throw new Error(`Chain id ${chainId} is not supported.`)
        return chainId
    }

    private set chainId(newChainId: ChainId) {
        const chainId = newChainId
        if (!isTorusSupported(chainId)) throw new Error(`Chain id ${chainId} is not supported.`)
        this.chainId_ = chainId
    }

    private async createTorus(chainId: ChainIdTorus) {
        const torus = new Torus.default()

        await torus.init({
            network: {
                host: getTorusNetworkType(chainId),
            },
            enableLogging: true,
            showTorusButton: false,
        })
        return torus
    }

    private async createProvider() {
        if (this.providerPool.has(this.chainId)) return this.providerPool.get(this.chainId)!

        const { provider } = await this.createTorus(this.chainId)
        this.providerPool.set(this.chainId, provider)
        return provider
    }

    private async login() {
        const provider = await this.createProvider()
        return provider.enable()
    }

    override async connect(chainId: ChainId) {
        try {
            this.chainId = chainId
            const accounts = await this.login()
            if (!accounts.length) throw new Error(`Failed to connect to ${chainResolver.chainFullName(this.chainId)}.`)
            return {
                account: first(accounts)!,
                chainId,
            }
        } catch (error) {
            this.chainId_ = null
            throw error
        }
    }

    override async disconnect(): Promise<void> {
        this.chainId_ = null
    }

    override async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        const provider = await this.createProvider()
        return provider.request(requestArguments) as Promise<T>
    }
}
