import * as jwt from 'jsonwebtoken'
import { sha3 } from 'web3-utils'
import Services from '../../extension/service'
import { resolveChainName } from '../../web3/pipes'

export async function mintCOTM_Packet(from: string): Promise<{ mint_transaction_hash: string }> {
    const host = 'https://redpacket.gives'
    const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

    const chainId = await Services.Ethereum.getChainId(from)
    const network = resolveChainName(chainId).toLowerCase()

    // skip hi
    const auth = await fetch(`${host}/hi?id=${from}&network=${network}`)
    if (!auth.ok) throw new Error('Auth failed')

    const verify = await auth.text()
    const jwt_encoded: {
        recipient: string
        validation: string
        signature: string
    } = {
        recipient: from,
        validation: sha3(from)!,
        signature: await Services.Ethereum.sign(verify, from, chainId),
    }
    const mintResponse = await fetch(
        `${host}/mrpresident?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
    )
    if (!mintResponse.ok) throw new Error('Claim failed')
    return { mint_transaction_hash: await mintResponse.text() }
}
