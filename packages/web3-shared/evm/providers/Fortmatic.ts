import Web3 from 'web3'
import type { provider as Provider, HttpProvider } from 'web3-core'
import { ChainId, getRPCConstants } from '..'
import Fortmatic from 'fortmatic'
import { first } from 'lodash-unified'

const TEST_KEY = 'pk_test_D3D403709D9F8A73'
const LIVE_KEY = 'pk_live_EDC387083BCC4787'
export const API_KEY_CHAIN_MAPPINGS = {
    [ChainId.Mainnet]: LIVE_KEY,
    [ChainId.BSC]: LIVE_KEY,
    [ChainId.Matic]: LIVE_KEY,
    [ChainId.Rinkeby]: TEST_KEY,
    [ChainId.Ropsten]: TEST_KEY,
    [ChainId.Kovan]: TEST_KEY,
}

export type FortmaticSupportedChainId = keyof typeof API_KEY_CHAIN_MAPPINGS

//#region providers
const providerPool = new Map<FortmaticSupportedChainId, Provider>()

let web3: Web3 | null = null

export function createProvider(chainId: FortmaticSupportedChainId) {
    let provider = providerPool.get(chainId)
    if (provider) return provider as HttpProvider
    const rpcUrl = first(getRPCConstants(chainId).RPC)!
    const fm = new Fortmatic(API_KEY_CHAIN_MAPPINGS[chainId], { chainId, rpcUrl })
    provider = fm.getProvider() as Provider
    providerPool.set(chainId, provider)
    return provider as HttpProvider
}

export async function createWeb3(props: { chainId: ChainId }) {
    const { chainId } = props
    const provider = createProvider(chainId as FortmaticSupportedChainId) as Provider
    if (web3) {
        const currentChainId = await web3.eth.getChainId()
        if (currentChainId === chainId) return web3
        else {
            web3.setProvider(provider)
            return web3
        }
    }
    web3 = new Web3(provider)
    return web3
}

export async function requestAccounts(chainId: ChainId) {
    const web3 = await createWeb3({ chainId })
    const accounts = await web3.eth.getAccounts()
    return {
        accounts,
        chainId,
    }
}

export async function connect(chainId: ChainId) {
    const { accounts } = await requestAccounts(chainId)
    return {
        account: first(accounts),
        chainId,
    }
}
