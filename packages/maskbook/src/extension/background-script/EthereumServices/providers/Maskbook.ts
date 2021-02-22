import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import { currentMaskbookChainIdSettings } from '../../../../settings/settings'
import { getConstant } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'

//#region providers
const providerPool = new Map<number, HttpProvider[]>()
const providerCursor = new Map<number, number>()

export function createProvider(chainId = currentMaskbookChainIdSettings.value) {
    const urls = getConstant(CONSTANTS, 'PROVIDER_ADDRESS_LIST', chainId)
    const providers = providerPool.get(chainId) ?? makeProviders(chainId, urls)
    if (!providerPool.has(chainId)) {
        providerPool.set(chainId, providers)
    }
    const cursor = providerCursor.get(chainId) ?? 0
    return providers[cursor % providers.length]
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

export function createWeb3(chainId = currentMaskbookChainIdSettings.value, privKeys: string[] = []) {
    const provider = createProvider(chainId)
    const web3 = createWeb3Instance(provider)
    if (privKeys.length) {
        web3.eth.accounts.wallet.clear()
        privKeys.forEach((k) => k && k !== '0x' && web3.eth.accounts.wallet.add(k))
    }
    return web3
}
//#endregion

function makeProviders(chainId: number, urls: string[]) {
    const options = {
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
    }
    return urls.map((url) => withHTTPProvider(chainId, new Web3.providers.HttpProvider(url, options)))
}

function withHTTPProvider(chainId: number, provider: HttpProvider) {
    const maxAttempts = 3
    let errorCount = 0
    let sent = false
    return new Proxy(provider, {
        get(target, p) {
            if (p === 'send') {
                const sender: typeof target.send = (payload, callback) => {
                    if (payload?.method === 'eth_sendRawTransaction') {
                        if (sent) {
                            callback(new Error('ETH_COMPETITIVE_TRANSACTION'))
                            return
                        }
                        sent = true
                    }
                    target.send(payload, (error, result) => {
                        if (payload?.method === 'eth_sendRawTransaction' && sent) {
                            sent = false
                        }
                        if (error) {
                            errorCount++
                        }
                        if (errorCount > maxAttempts) {
                            errorCount = 0
                            providerCursor.set(chainId, (providerCursor.get(chainId) ?? 0) + 1)
                        }
                        callback(error, result)
                    })
                }
                return sender
            }
            return Reflect.get(target, p)
        },
    })
}
