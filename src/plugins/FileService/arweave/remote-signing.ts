import { encode } from '@msgpack/msgpack'
import type Transaction from 'arweave/web/lib/transaction'
import { stringToBuffer as toBuffer } from 'arweave/web/lib/utils'
import { signing } from '../constants'

export async function sign(transaction: Transaction) {
    const response = await fetch(signing, {
        method: 'POST',
        body: await makeRequest(transaction),
    })
    transaction.setSignature(await response.json())
}

async function makeRequest(transaction: Transaction) {
    await transaction.prepareChunks(transaction.data)
    return encode([
        toBuffer(transaction.format.toString()),
        transaction.get('owner', { decode: true, string: false }),
        transaction.get('target', { decode: true, string: false }),
        toBuffer(transaction.quantity),
        toBuffer(transaction.reward),
        transaction.get('last_tx', { decode: true, string: false }),
        transaction.tags.map((tag) => [
            tag.get('name', { decode: true, string: false }),
            tag.get('value', { decode: true, string: false }),
        ]),
        toBuffer(transaction.data_size),
        transaction.get('data_root', { decode: true, string: false }),
    ])
}
