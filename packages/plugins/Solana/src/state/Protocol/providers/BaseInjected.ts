import { delay } from '@dimensiondev/kit'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { isExtensionSiteType } from '@masknet/shared-base'
import { ChainId, SolanaProvider } from '@masknet/web3-shared-solana'
import type { Provider } from '../types'
import { BaseProvider } from './Base'

export class BaseInjectedProvider extends BaseProvider implements Provider {
    constructor(protected path = ['solana']) {
        super()
    }

    // Retrieve the in-page provider instance from the global variable.
    protected get inpageProvider() {
        if (!this.path.length) return null

        let result: unknown = window

        for (const name of this.path) {
            // @ts-ignore
            result = Reflect.has(result, name)
            if (!result) return null
        }
        return result as SolanaProvider
    }

    override get ready() {
        return !!this.inpageProvider
    }

    protected onAccountsChanged() {
        console.log('DEBUG: onAccountsChanged')
        this.emitter.emit('accounts', [])
    }

    protected onNetworkChanged() {
        console.log('DEBUG: onNetworkChanged')
        this.emitter.emit('chainId', ChainId.Mainnet.toFixed(16))
    }

    protected onDisconnect() {
        console.log('DEBUG: onDisconnect')
        this.emitter.emit('discconect')
    }

    override async createWeb3Provider(chainId?: ChainId) {
        await this.readyPromise

        if (this.provider) return this.provider
        if (!this.inpageProvider) throw new Error('Failed to detect in-page provider.')
        if (isExtensionSiteType()) throw new Error('Not avaiable on extension site.')

        this.provider = this.inpageProvider
        this.provider.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.provider.on('chainChanged', this.onNetworkChanged.bind(this))
        this.provider.on('networkChanged', this.onNetworkChanged.bind(this))
        this.provider.on('disconnect', this.onDisconnect.bind(this))
        return this.provider
    }

    override get readyPromise() {
        if (isExtensionSiteType()) return Promise.reject(new Error('Not avaiable on extension site.'))

        return new Promise<void>(async (resolve, reject) => {
            let i = 60 // wait for 60 iteration, total 60s

            while (i > 0) {
                i -= 1
                if (this.ready) {
                    resolve()
                    return
                }
                await delay(1000)
            }
            reject('Failed to detect in-page provider instance.')
        })
    }

    override async connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        await this.readyPromise

        const provider = await this.createWeb3Provider()
        const { publicKey } = await provider.connect()
        return {
            chainId,
            account: publicKey.toBase58(),
        }
    }

    override async disconnect(): Promise<void> {
        const provider = await this.createWeb3Provider()
        await provider.disconnect()
    }
}
