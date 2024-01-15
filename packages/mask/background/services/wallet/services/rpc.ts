import { first } from 'lodash-es'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { createWalletDBAccess } from '../database/Wallet.db.js'
import { createTransaction } from '../../../database/utils/openDB.js'
import type { RequestPayload } from '../database/types.js'
import { CrossIsolationMessages } from '@masknet/shared-base'

const MAX_UNCONFIRMED_REQUESTS_SIZE = 1
const MAIN_RECORD_ID = '0'

function requestSorter(a: JsonRpcPayload, z: JsonRpcPayload) {
    return ((a.id as number) ?? 0) - ((z.id as number) ?? 0)
}

async function getUnconfirmedRequests() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('UnconfirmedRequestChunk')
    const chunk = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    if (!chunk) return []
    return chunk.requests.slice(0, MAX_UNCONFIRMED_REQUESTS_SIZE).sort(requestSorter)
}

export async function topUnconfirmedRequest() {
    return first(await getUnconfirmedRequests())
}

export async function updateUnconfirmedRequest(payload: RequestPayload) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)

    if (!chunk_?.requests.length) throw new Error('No request to update.')

    const requests =
        chunk_.requests.map((item) => {
            if (item.id !== payload.id) return item
            return payload
        }) ?? []

    const chunk = {
        ...chunk_,
        updatedAt: now,
        requests,
    }

    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    CrossIsolationMessages.events.requestsUpdated.sendToAll({ hasRequest: true })
    return payload
}
