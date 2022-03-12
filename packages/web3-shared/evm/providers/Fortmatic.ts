import Fortmatic from 'fortmatic'
import type { RequestArguments } from 'web3-core'
import { first } from 'lodash-unified'
import type { FmProvider } from 'fortmatic/dist/cjs/src/core/fm-provider'
import { ChainId, EIP1193Provider, EthereumMethodType } from '../types'
import { createLookupTableResolver } from '../utils'
import { getRPCConstants } from '../constants'

// #region create in-page fortmatic provider

/* spell-checker: disable-next-line */
const TEST_KEY = 'pk_test_D9EAF9A8ACEC9627'

/* spell-checker: disable-next-line */
const LIVE_KEY = 'pk_live_331BE8AA24445030'

const resolveAPI_Key = createLookupTableResolver<ChainIdFortmatic, string>(
    {
        [ChainId.Mainnet]: LIVE_KEY,
        [ChainId.BSC]: LIVE_KEY,
        [ChainId.Matic]: LIVE_KEY,
        [ChainId.Rinkeby]: TEST_KEY,
        [ChainId.Ropsten]: TEST_KEY,
        [ChainId.Kovan]: TEST_KEY,
    },
    '',
)

const isFortmaticSupported = (chainId: ChainId): chainId is ChainIdFortmatic => {
    return [ChainId.Mainnet, ChainId.BSC].includes(chainId)
}

export type ChainIdFortmatic =
    | ChainId.Mainnet
    | ChainId.BSC
    | ChainId.Matic
    | ChainId.Rinkeby
    | ChainId.Ropsten
    | ChainId.Kovan

export default class FortmaticSKD implements EIP1193Provider {
    private providerPool = new Map<ChainId, FmProvider>()

    private createFortmatic(chainId: ChainId) {
        if (!isFortmaticSupported(chainId)) throw new Error('Not supported chain id.')

        const rpcUrl = first(getRPCConstants(chainId).RPC)
        if (!rpcUrl) throw new Error('Failed to create provider.')
        return new Fortmatic(resolveAPI_Key(chainId), { chainId, rpcUrl })
    }

    private createProvider(chainId: ChainId) {
        if (this.providerPool.has(chainId)) return this.providerPool.get(chainId)!

        const fm = this.createFortmatic(chainId)
        const provider = fm.getProvider()
        this.providerPool.set(chainId, provider)
        return provider
    }

    login(chainId: ChainId) {
        const provider = this.createProvider(chainId)
        return provider.enable()
    }
    logout(chainId: ChainId) {
        const fm = this.createFortmatic(chainId)
        return fm.user.logout()
    }

    request<T extends unknown>(
        requestArguments: RequestArguments,
        { chainId = ChainId.Mainnet }: { chainId?: ChainId } = {},
    ) {
        const chainId_ = chainId as ChainIdFortmatic
        const provider = this.createProvider(chainId as ChainIdFortmatic)

        switch (requestArguments.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                return this.login(chainId_) as Promise<T>
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                return this.logout(chainId_) as Promise<T>
            default:
                return provider.send<T>(requestArguments.method, requestArguments.params)
        }
    }

    on(name: string, listener: (event: any) => void): EIP1193Provider {
        return this
    }
    removeListener(name: string, listener: (event: any) => void): EIP1193Provider {
        return this
    }
}
