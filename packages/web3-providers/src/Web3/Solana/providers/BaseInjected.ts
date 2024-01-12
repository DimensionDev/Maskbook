import { isExtensionSiteType, type Account } from '@masknet/shared-base'
import type { InjectedWalletBridge } from '@masknet/injected-script'
import { ChainId, type ProviderType, type Web3Provider } from '@masknet/web3-shared-solana'
import { BaseSolanaWalletProvider } from './Base.js'

export abstract class SolanaInjectedWalletProvider extends BaseSolanaWalletProvider {
    protected abstract providerType: ProviderType
    protected abstract bridge: InjectedWalletBridge

    override get ready() {
        return this.bridge.isReady
    }

    get readyPromise() {
        if (!isExtensionSiteType()) return this.bridge.untilAvailable()
        return Promise.reject(new Error('Not available on extension site.'))
    }

    setup() {
        this.bridge.on('accountChanged', this.onAccountChanged.bind(this))
        this.bridge.on('chainChanged', this.onChainChanged.bind(this))
        this.bridge.on('connect', this.onConnect.bind(this))
        this.bridge.on('disconnect', this.onDisconnect.bind(this))
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

    private createWeb3Provider() {
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
