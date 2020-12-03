import Services from '../../extension/service'
import { resolveChainName } from '../../web3/pipes'
import { sha3 } from 'web3-utils'
import * as jwt from 'jsonwebtoken'
import type { ITOJSONPayload } from './types'

export async function claimITO(
    from: string,
    rpid: string,
    password: string,
): Promise<{ claim_transaction_hash: string }> {
    const host = 'https://redpacket.gives'
    const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

    const chainId = await Services.Ethereum.getChainId(from)
    const network = resolveChainName(chainId).toLowerCase()

    const auth = await fetch(`${host}/hi?id=${from}&network=${network}`)
    if (!auth.ok) {
        throw new Error('Auth failed')
    }

    const verify = await auth.text()
    const jwt_encode: {
        password: string
        recipient: string
        ito_id: string
        validation: string
        signature: string
    } = {
        password,
        recipient: from,
        ito_id: rpid,
        validation: sha3(from),
        signature: await Services.Ethereum.sign(verify, from, chainId),
    }

    const pay = await fetch(
        `${host}/please?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
    )

    if (!pay.ok) {
        throw new Error('Pay failed')
    }
    return { claim_transaction_hash: await pay.text() }
}

export async function discoverITO(from: string, payload: ITOJSONPayload) {
    if (!payload.rpid) {
        return
    }
    if (!payload.password) {
        return
    }
}
