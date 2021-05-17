import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import { currentMaskbookChainIdSettings } from '../../../../plugins/Wallet/settings'
import { getConstant } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'
import type { ChainId } from '../../../../web3/types'

//#region providers
const providerPool = new Map<string, HttpProvider>()

export function createProvider(url: string) {
    const provider =
        providerPool.get(url) ??
        new Web3.providers.HttpProvider(url, {
            timeout: 5000, // ms
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
    providerPool.set(url, provider)
    return provider
}
//#endregion

//#region web3 instances
const instancePool = new Map<string, Web3>()

function createWeb3Instance(provider: HttpProvider) {
    return instancePool.get(provider.host) ?? new Web3(provider)
}

export function createWeb3({
    url = '',
    chainId = currentMaskbookChainIdSettings.value,
    privKeys = [],
}: {
    url?: string
    chainId?: ChainId
    privKeys?: string[]
} = {}) {
    // get the provider url by weights if needed
    if (!url) {
        const urls = getConstant(CONSTANTS, 'PROVIDER_ADDRESS_LIST', chainId)
        const weights = getConstant(CONSTANTS, 'PROVIDER_WEIGHT_LIST', chainId)
        const seed = getConstant(CONSTANTS, 'PROVIDER_WEIGHT_SEED', chainId)
        url = urls[weights[seed]]
    }
    const provider = createProvider(url)
    const web3 = createWeb3Instance(provider)
    if (privKeys.length) {
        web3.eth.accounts.wallet.clear()
        privKeys.forEach((k) => k && k !== '0x' && web3.eth.accounts.wallet.add(k))
    }
    return web3
}
//#endregion
