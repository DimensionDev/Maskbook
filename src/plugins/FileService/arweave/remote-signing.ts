import type Transaction from 'arweave/web/lib/transaction'

const endpoint = 'https://tfuhgly4y0.execute-api.ap-east-1.amazonaws.com/arweave-submit-agent'

export async function sign(transaction: Transaction) {
    const response = await fetch(endpoint, {
        method: 'POST',
        body: await transaction.getSignatureData(),
    })
    const signed = await response.json()
    transaction.setSignature(signed)
}
