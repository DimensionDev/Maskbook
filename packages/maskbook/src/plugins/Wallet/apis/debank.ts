import type { HISTORY_RESPONSE } from '../types'

const DEBANK_API = 'https://api.debank.com'

export async function getTransactionList(address: string) {
    const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}`, {
        cache: 'force-cache',
    })
    return (await response.json()) as HISTORY_RESPONSE
}
