import Fortmatic from 'fortmatic'
import type { RequestArguments } from 'web3-core'
import { first, noop } from 'lodash-unified'
import type { FmProvider } from 'fortmatic/dist/cjs/src/core/fm-provider'
import { ChainId, EthereumMethodType } from '../types'
import { createLookupTableResolver, isFortmaticSupported } from '../utils'
import { getRPCConstants } from '../constants'

// #region create in-page fortmatic provider

/* spell-checker: disable-next-line */
const TEST_KEY = 'pk_test_D9EAF9A8ACEC9627'

/* spell-checker: disable-next-line */
const LIVE_KEY = 'pk_live_331BE8AA24445030'

export type ChainIdFortmatic =
    | ChainId.Mainnet
    | ChainId.BSC
    | ChainId.Matic
    | ChainId.Rinkeby
    | ChainId.Ropsten
    | ChainId.Kovan

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

const providerPool = new Map<ChainId, FmProvider>()

function createFortmatic(chainId: ChainIdFortmatic) {
    const rpcUrl = first(getRPCConstants(chainId).RPC)
    if (!rpcUrl) throw new Error('Failed to create provider.')
    return new Fortmatic(resolveAPI_Key(chainId), { chainId, rpcUrl })
}

function createProvider(chainId: ChainIdFortmatic) {
    if (providerPool.has(chainId)) return providerPool.get(chainId)!

    const fm = createFortmatic(chainId)
    const provider = fm.getProvider()
    providerPool.set(chainId, provider)
    return provider
}

export default {
    login(chainId: ChainIdFortmatic) {
        const provider = createProvider(chainId)
        return provider.enable()
    },
    logout(chainId: ChainIdFortmatic) {
        const fm = createFortmatic(chainId)
        return fm.user.logout()
    },
    request<T extends unknown>(requestArguments: RequestArguments, chainId = ChainId.Mainnet) {
        if (!isFortmaticSupported(chainId)) throw new Error('Not supported chain id.')

        const chainId_ = chainId as ChainIdFortmatic
        const provider = createProvider(chainId as ChainIdFortmatic)

        switch (requestArguments.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                return this.login(chainId_)
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                return this.logout(chainId_)
            default:
                return provider.send(requestArguments.method, requestArguments.params) as Promise<T>
        }
    },
    on() {
        return noop
    },
}
