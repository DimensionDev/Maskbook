import { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import {
    cryptoartaiHostnames,
    cryptoartaiAPIEndpoint,
    cryptoartaiPathnameRegexMatcher,
    cryptoartaiPaymentTokens,
} from '../constants'

export function resolveAPILinkOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return cryptoartaiAPIEndpoint[1]
    }

    return cryptoartaiAPIEndpoint[0]
}

export function resolveWebLinkOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return 'https://' + cryptoartaiHostnames[1]
    }

    return 'https://' + cryptoartaiHostnames[0]
}

export function resolveAssetLinkOnCryptoartAI(creator: string, token_id: string, chainId?: ChainId) {
    return urlcat(resolveWebLinkOnCryptoartAI(chainId) + cryptoartaiPathnameRegexMatcher, `${creator}/${token_id}`)
}

export function resolvePaymentTokensOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return [cryptoartaiPaymentTokens[1]]
    }

    return [cryptoartaiPaymentTokens[0]]
}
