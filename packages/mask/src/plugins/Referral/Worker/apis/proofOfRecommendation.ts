import { getAddress } from '@ethersproject/address'
import { formatBytes32String } from '@ethersproject/strings'

import type Web3 from 'web3'
import { EvmAddress, RpcMethod } from '../../types'

import { MASK_REFERRER, ZERO_HASH, ZERO_ADDR, MASK_SWAP_V1 } from '../../constants'
import { getOracle, rpcCall } from './oracle'

// Get a time signature from the oracle (all fields required, send sized 0x000....00 when not used)
type TPropsTimeSignature = {
    account: string
    tokenAddress: string
    referrer: string
    dapp: string
    router: string
    host?: string
}
export async function getTimeSignature(props: TPropsTimeSignature) {
    const { account, tokenAddress, referrer, dapp, router } = props
    const host = props.host || (await getOracle())

    const { result } = await rpcCall(host, RpcMethod.oracle_getTimePromise, [
        account,
        tokenAddress,
        referrer,
        dapp,
        router,
    ])

    return {
        time: Number(result.time),
        timePromise: result.sig,
    }
}

// create proof by origin(PROMOTER), referrer = ZERO_ADDR
export async function singAndPostProofOfRecommendationOrigin(web3: Web3, account: string, tokenAddress: string) {
    const host = await getOracle()
    const router = MASK_REFERRER

    const { time, timePromise } = await getTimeSignature({
        account,
        tokenAddress,
        referrer: ZERO_ADDR,
        dapp: ZERO_HASH,
        router,
        host,
    })

    const sig = await web3.eth.personal.sign(
        makePreEip721ProofOfRecommendationOrigin(account, tokenAddress, time, router),
        account,
        '',
    )

    // Post signed proof of recommendation which has a time promise from the store.
    const res = await rpcCall(host, RpcMethod.oracle_sendProofOfRecommendationOrigin, [
        {
            signer: getAddress(account),
            token: getAddress(tokenAddress),
            router: getAddress(router),
            time,
            sig,
            timePromises: [timePromise],
        },
    ])
    return res
}

// create proof by PARTICIPANT, referrer = PROMOTER_ADDRESS
export async function singAndPostProofOfRecommendationWithReferrer(
    web3: Web3,
    account: string,
    tokenAddress: EvmAddress,
    referrer: EvmAddress,
) {
    const host = await getOracle()
    const router = MASK_REFERRER
    // The link destination dapp we are linking to
    const dapp = formatBytes32String(MASK_SWAP_V1)

    const { time, timePromise } = await getTimeSignature({ account, tokenAddress, referrer, dapp, router, host })

    const sig = await web3.eth.personal.sign(
        makePreEip721ProofOfRecommendation(account, tokenAddress, time, dapp, referrer, router),
        account,
        '',
    )

    const res = await rpcCall(host, RpcMethod.oracle_sendProofOfRecommendation, [
        {
            signer: getAddress(account),
            token: getAddress(tokenAddress),
            referrer: getAddress(referrer),
            dapp,
            router: getAddress(router),
            time,
            sig,
            timePromises: [timePromise],
            linkReferrer: document.referrer,
        },
    ])

    return res
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
