import { encode } from '@msgpack/msgpack'
import type Transaction from 'arweave/web/lib/transaction.js'
import { ARWEAVE_SIGNING } from '../constants.js'

export async function sign(transaction: Transaction.default) {
    const response = await fetch(ARWEAVE_SIGNING, {
        method: 'POST',
        body: Uint8Array.from(await makeRequest(transaction)),
    })
    transaction.setSignature(await response.json())
}

async function makeRequest(transaction: Transaction.default) {
    const encoder = new TextEncoder()
    await transaction.prepareChunks(transaction.data)
    const get = (base: { get: typeof transaction.get }, name: string) => base.get(name, { decode: true, string: false })
    return encode([
        encoder.encode(transaction.format.toString()),
        get(transaction, 'owner'),
        get(transaction, 'target'),
        encoder.encode(transaction.quantity),
        encoder.encode(transaction.reward),
        get(transaction, 'last_tx'),
        transaction.tags.map((tag) => [get(tag, 'name'), get(tag, 'value')]),
        encoder.encode(transaction.data_size),
        get(transaction, 'data_root'),
    ])
}
