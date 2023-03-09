import { isExtensionSiteType } from '@masknet/shared-base'
import type { InjectedProvider } from '@masknet/injected-script'
import type { Account, ProviderOptions } from '@masknet/web3-shared-base'
import { ChainId, type ProviderType, type Web3Provider } from '@masknet/web3-shared-solana'
import { BaseProvider } from './Base.js'
import type { SolanaProvider } from '../types.js'

export class BaseInjectedProvider extends BaseProvider implements SolanaProvider {
    constructor(protected providerType: ProviderType, protected bridge: InjectedProvider) {
        super()

        bridge.on('accountChanged', this.onAccountChanged.bind(this))
        bridge.on('chainChanged', this.onChainChanged.bind(this))
        bridge.on('connect', this.onConnect.bind(this))
        bridge.on('disconnect', this.onDisconnect.bind(this))
    }

    override get ready() {
        return this.bridge.isReady
    }

    override get readyPromise() {
        if (isExtensionSiteType()) return Promise.reject(new Error('Not available on extension site.'))
        return this.bridge.untilAvailable().then(() => undefined)
    }

    protected onAccountChanged(account: string) {
        this.emitter.emit('accounts', [account])
    }

    protected onChainChanged(chainId: string) {
        this.emitter.emit('chainId', chainId)
    }

    protected onConnect(account: string) {
        this.emitter.emit('connect', {
            account,
            chainId: ChainId.Mainnet,
        })
    }

    protected onDisconnect() {
        this.emitter.emit('disconnect', this.providerType)
    }

    override createWeb3Provider(options?: ProviderOptions<ChainId>) {
        if (!this.bridge) throw new Error('Failed to detect in-page provider.')
        return this.bridge as unknown as Web3Provider
    }

    override async connect(chainId: ChainId): Promise<Account<ChainId>> {
        await this.readyPromise

        const provider = this.createWeb3Provider()
        const { publicKey } = await provider.connect()

        return {
            chainId,
            account: publicKey,
        }
    }

    override async disconnect(): Promise<void> {
        await this.readyPromise

        const provider = this.createWeb3Provider()
        await provider.disconnect()
    }
}
