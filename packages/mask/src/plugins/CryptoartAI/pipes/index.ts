import { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { pathnameRegexMatcher, mainNetwork, testNetwork } from '../constants'

export function resolveAPILinkOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return testNetwork.endpoint
    }

    return mainNetwork.endpoint
}

export function resolveWebLinkOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return `https://${testNetwork.hostname}`
    }

    return `https://${mainNetwork.hostname}`
}

export function resolveAssetLinkOnCryptoartAI(creator: string, token_id: string, chainId?: ChainId) {
    return urlcat(resolveWebLinkOnCryptoartAI(chainId) + pathnameRegexMatcher, `${creator}/${token_id}`)
}

export function resolvePaymentTokensOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return [testNetwork.paymentToken]
    }

    return [mainNetwork.paymentToken]
}
