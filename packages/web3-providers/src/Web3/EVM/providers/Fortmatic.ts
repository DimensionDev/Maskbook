import { first } from 'lodash-es'
import Fortmatic from 'fortmatic'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { timeout } from '@masknet/kit'
import type { FmProvider } from 'fortmatic/dist/cjs/src/core/fm-provider.js'
import { ChainId, ProviderURL, ProviderType, type RequestArguments } from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/shared-base'
import { EVMChainResolver } from '../apis/ResolverAPI.js'
import { BaseEVMWalletProvider } from './Base.js'

// #region create in-page fortmatic provider

/* spell-checker: disable-next-line */
const TEST_KEY = 'pk_test_D9EAF9A8ACEC9627'

/* spell-checker: disable-next-line */
const LIVE_KEY = 'pk_live_331BE8AA24445030'

const resolveAPI_Key = createLookupTableResolver<ChainIdFortmatic, string>(
    {
        [ChainId.Mainnet]: LIVE_KEY,
        [ChainId.BSC]: LIVE_KEY,
        [ChainId.Polygon]: LIVE_KEY,
        [ChainId.Rinkeby]: TEST_KEY,
        [ChainId.Ropsten]: TEST_KEY,
        [ChainId.Kovan]: TEST_KEY,
    },
    '',
)

const isFortmaticSupported = (chainId: ChainId): chainId is ChainIdFortmatic => {
    return [ChainId.Mainnet, ChainId.BSC].includes(chainId)
}

type ChainIdFortmatic =
    | ChainId.Mainnet
    | ChainId.BSC
    | ChainId.Polygon
    | ChainId.Rinkeby
    | ChainId.Ropsten
    | ChainId.Kovan

export class FortmaticProvider extends BaseEVMWalletProvider {
    /**
     * If the internal chain id exists, it means the connection was created.
     * Otherwise, no connection was created before.
     */
    private chainId_: ChainIdFortmatic | null = null
    private providerPool = new Map<ChainId, FmProvider>()

    private get chainId(): ChainIdFortmatic {
        const chainId = this.chainId_
        if (!chainId) throw new Error('No fortmatic connection.')
        if (!isFortmaticSupported(chainId)) throw new Error(`The chain id ${chainId} is not supported.`)
        return chainId
    }

    private set chainId(newChainId: ChainId) {
        const chainId = newChainId
        if (!isFortmaticSupported(chainId)) throw new Error(`The chain id ${chainId} is not supported.`)
        this.chainId_ = chainId
    }

    constructor() {
        super(ProviderType.Fortmatic)
    }

    protected onAccountsChanged(accounts: string[]) {
        this.emitter.emit('accounts', accounts)
    }

    protected onChainChanged(chainId: string) {
        this.emitter.emit('chainId', chainId)
    }

    protected onConnect(connected: { account: string; chainId: ChainId }) {
        this.emitter.emit('connect', connected)
    }

    private createFortmatic(chainId: ChainIdFortmatic) {
        return new Fortmatic(resolveAPI_Key(chainId), {
            chainId,
            rpcUrl: ProviderURL.from(chainId),
        })
    }

    private createProvider() {
        if (this.providerPool.has(this.chainId)) return this.providerPool.get(this.chainId)!

        const fm = this.createFortmatic(this.chainId)
        const provider = fm.getProvider()
        this.providerPool.set(this.chainId, provider)
        return provider
    }

    private login() {
        const fm = this.createFortmatic(this.chainId)
        return fm.user.login()
    }

    private async logout() {
        const fm = this.createFortmatic(this.chainId)
        return fm.user.logout()
    }

    override async switchChain(chainId: ChainId): Promise<void> {
        if (!isFortmaticSupported(chainId)) throw new Error('Invalid chain id.')
        await this.connect(chainId)
    }

    override async connect(chainId: ChainId) {
        try {
            this.chainId = chainId
            const accounts = await this.login()
            if (!accounts.length)
                throw new Error(`Failed to connect to ${EVMChainResolver.chainFullName(this.chainId)}.`)

            const connected = {
                account: first(accounts)!,
                chainId,
            }

            this.onAccountsChanged(accounts)
            this.onChainChanged(web3_utils.toHex(chainId))
            this.onConnect(connected)
            return connected
        } catch (error) {
            this.chainId_ = null
            throw error
        }
    }

    override async disconnect() {
        try {
            await timeout(this.logout(), 3000, 'Timeout to logout fortmatic account.')
        } catch {
            // do nothing
        } finally {
            this.chainId_ = null
        }
    }

    override request<T>(requestArguments: RequestArguments) {
        return this.createProvider().send<T>(requestArguments.method, requestArguments.params)
    }
}
