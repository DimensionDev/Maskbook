import { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { prefixPath, mainNetwork, testNetwork } from '../constants'

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
    return urlcat(resolveWebLinkOnCryptoartAI(chainId), `${prefixPath}/:creator/:token_id`, {
        creator: encodeURI(creator),
        token_id,
    })
}

export function resolvePaymentTokensOnCryptoartAI(chainId?: ChainId) {
    if (chainId === ChainId.Kovan) {
        return [testNetwork.paymentToken]
    }

    return [mainNetwork.paymentToken]
}
