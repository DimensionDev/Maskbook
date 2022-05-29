import { getAddress } from '@ethersproject/address'

import { EvmAddress, RpcMethod } from '../../types'

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

    const { result } = await rpcCall(
        host,
        RpcMethod.oracle_getTimePromise,
        [
            account,
            tokenAddress,
            referrer,
            dapp,
            router,
        ],
        true, // PoR request
    )

    return {
        time: Number(result.time),
        timePromise: result.sig,
    }
}

// create proof by origin(PROMOTER), referrer = ZERO_ADDR
export async function postProofOfRecommendationOrigin(
    account: string,
    tokenAddress: string,
    router: string,
    time: number,
    timePromise: string,
    sig: string,
) {
    const host = await getOracle()

    // Post signed proof of recommendation which has a time promise from the store.
    const res = await rpcCall(
        host,
        RpcMethod.oracle_sendProofOfRecommendationOrigin,
        [
            {
                signer: getAddress(account),
                token: getAddress(tokenAddress),
                router: getAddress(router),
                time,
                sig,
                timePromises: [timePromise],
            },
        ],
        true, // PoR request
    )
    return res
}

// create proof by PARTICIPANT, referrer = PROMOTER_ADDRESS
export async function postProofOfRecommendationWithReferrer(
    account: string,
    tokenAddress: EvmAddress,
    referrer: EvmAddress,
    dapp: string,
    router: EvmAddress,
    time: number,
    timePromise: string,
    sig: string,
) {
    const host = await getOracle()

    const res = await rpcCall(
        host,
        RpcMethod.oracle_sendProofOfRecommendation,
        [
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
        ],
        true, // PoR request
    )
    return res
}
