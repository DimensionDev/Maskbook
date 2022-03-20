import Fortmatic from 'fortmatic'
import { first } from 'lodash-unified'
import type { FmProvider } from 'fortmatic/dist/cjs/src/core/fm-provider'
import { ChainId } from '../types'
import { createLookupTableResolver } from '../utils'
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

export function createFortmatic(chainId: ChainIdFortmatic) {
    const rpcUrl = first(getRPCConstants(chainId).RPC)
    if (!rpcUrl) throw new Error('Failed to create provider.')
    return new Fortmatic(resolveAPI_Key(chainId), { chainId, rpcUrl })
}

export function createProvider(chainId: ChainIdFortmatic) {
    if (providerPool.has(chainId)) return providerPool.get(chainId)!

    const fm = createFortmatic(chainId)
    const provider = fm.getProvider()
    providerPool.set(chainId, provider)
    return provider
}

export function login(chainId: ChainIdFortmatic) {
    const provider = createProvider(chainId)
    return provider.enable()
}

export function logout(chainId: ChainIdFortmatic) {
    const fm = createFortmatic(chainId)
    return fm.user.logout()
}
