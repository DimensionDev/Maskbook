import { encode } from '@msgpack/msgpack'
import type Transaction from 'arweave/web/lib/transaction'
import { stringToBuffer as toBuffer } from 'arweave/web/lib/utils'
import { signing } from '../constants'

export async function sign(transaction: Transaction) {
    const response = await fetch(signing, {
        method: 'POST',
        body: (await makeRequest(transaction)).buffer,
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
