import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import { currentMaskbookChainIdSettings } from '../../../../settings/settings'
import { ChainId } from '../../../../web3/types'
import { getConstant } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'

//#region tracking chain id
let currentChainId: ChainId = ChainId.Mainnet
currentMaskbookChainIdSettings.addListener((v) => (currentChainId = v))
//#endregion

//#region providers
const providerPool = new Map<string, HttpProvider>()

export function createProvider(chainId = currentChainId) {
    const url = getConstant(CONSTANTS, 'INFURA_ADDRESS', chainId)
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
    const web3 = instancePool.get(provider.host) ?? new Web3()
    if (web3.currentProvider !== provider) web3.setProvider(provider)

    // 24 confirmation blocks is not necessary
    web3.eth.transactionConfirmationBlocks = 0
    return web3
}

export function createWeb3(chainId: ChainId = currentChainId, privKeys: string[] = []) {
    const provider = createProvider(chainId)
    const web3 = createWeb3Instance(provider)
    if (privKeys.length) {
        web3.eth.accounts.wallet.clear()
        privKeys.forEach((k) => web3.eth.accounts.wallet.add(k))
    }
    return web3
}
//#endregion
