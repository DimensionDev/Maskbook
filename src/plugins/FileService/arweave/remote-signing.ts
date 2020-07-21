import type Transaction from 'arweave/web/lib/transaction'
import { signing } from '../constants'

export async function sign(transaction: Transaction) {
    const response = await fetch(signing, {
        method: 'POST',
        body: await transaction.getSignatureData(),
    })
    const signed = await response.json()
    transaction.setSignature(signed)
}
