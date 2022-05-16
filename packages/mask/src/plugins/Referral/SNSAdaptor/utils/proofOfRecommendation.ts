import { formatBytes32String } from '@ethersproject/strings'
import type Web3 from 'web3'

import { MASK_SWAP_V1, MASK_REFERRER, ZERO_ADDR, ZERO_HASH, errors } from '../../constants'

import { ReferralRPC } from '../../messages'

function parseError(error: Error) {
    switch (error.message) {
        case errors.rpc:
            return {
                ...error,
                message: 'Oracle is not responding at the moment. Please try in a few minutes.',
            }
        default:
            return error
    }
}

export function makePreEip721ProofOfRecommendationOrigin(signer: string, token: string, time: number, router: string) {
    return [
        'Sign this message to register for rewards.',
        '',
        "This won't cost you any Ether.",
        '',
        `Signer: ${signer.toLowerCase()}`,
        `Token: ${token.toLowerCase()}`,
        `Time: ${time}`,
        '',
        `Context: ${router.toLowerCase()}`,
    ].join('\n')
}

export function makePreEip721ProofOfRecommendation(
    signer: string,
    token: string,
    time: number,
    dapp: string,
    referrer: string,
    router: string,
) {
    return [
        'Sign this message to register for rewards.',
        '',
        "This won't cost you any Ether.",
        '',
        `Signer: ${signer.toLowerCase()}`,
        `Token: ${token.toLowerCase()}`,
        `Time: ${time}`,
        '',
        `Context: ${dapp},${referrer.toLowerCase()},${router.toLowerCase()}`,
    ].join('\n')
}

export const singAndPostProofOfRecommendationOrigin = async (web3: Web3, account: string, tokenAddress: string) => {
    const router = MASK_REFERRER
    try {
        const { time, timePromise } = await ReferralRPC.getTimeSignature({
            account,
            tokenAddress,
            referrer: ZERO_ADDR,
            dapp: ZERO_HASH,
            router,
        })

        const signature = await web3.eth.personal.sign(
            makePreEip721ProofOfRecommendationOrigin(account, tokenAddress, time, router),
            account,
            '',
        )

        await ReferralRPC.postProofOfRecommendationOrigin(account, tokenAddress, router, time, timePromise, signature)
    } catch (error) {
        throw parseError(error as Error)
    }
}

export const singAndPostProofOfRecommendationWithReferrer = async (
    web3: Web3,
    account: string,
    tokenAddress: string,
    referrer: string,
) => {
    const router = MASK_REFERRER
    const dapp = formatBytes32String(MASK_SWAP_V1)
    try {
        const { time, timePromise } = await ReferralRPC.getTimeSignature({
            account,
            tokenAddress,
            referrer,
            dapp,
            router,
        })
        const signature = await web3.eth.personal.sign(
            makePreEip721ProofOfRecommendation(account, tokenAddress, time, dapp, referrer, router),
            account,
            '',
        )

        await ReferralRPC.postProofOfRecommendationWithReferrer(
            account,
            tokenAddress,
            referrer,
            dapp,
            router,
            time,
            timePromise,
            signature,
        )
    } catch (error) {
        throw parseError(error as Error)
    }
}
