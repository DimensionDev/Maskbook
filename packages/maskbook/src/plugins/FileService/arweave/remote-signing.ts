import { encode } from '@msgpack/msgpack'
import type Transaction from 'arweave/web/lib/transaction'
import { stringToBuffer as toBuffer } from 'arweave/web/lib/utils'
import { signing } from '../constants'

export async function sign(transaction: Transaction) {
    const response = await fetch(signing, {
        method: 'POST',
        // Allow workaround based on version
        // headers: { 'mask-version': process.env.VERSION },
        // Temporary workaround for https://github.com/msgpack/msgpack-javascript/issues/145
        body: Uint8Array.from(await makeRequest(transaction)),
    })
    transaction.setSignature(await response.json())
}

async function makeRequest(transaction: Transaction) {
    await transaction.prepareChunks(transaction.data)
    const get = (base: { get: typeof transaction.get }, name: string) => base.get(name, { decode: true, string: false })
    return encode([
        toBuffer(transaction.format.toString()),
        get(transaction, 'owner'),
        get(transaction, 'target'),
        toBuffer(transaction.quantity),
        toBuffer(transaction.reward),
        get(transaction, 'last_tx'),
        transaction.tags.map((tag) => [get(tag, 'name'), get(tag, 'value')]),
        toBuffer(transaction.data_size),
        get(transaction, 'data_root'),
    ])
}
