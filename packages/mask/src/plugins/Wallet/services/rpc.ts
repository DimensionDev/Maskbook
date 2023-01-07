import { first } from 'lodash-es'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { createWalletDBAccess } from '../database/Wallet.db.js'
import { createTransaction } from '../../../../background/database/utils/openDB.js'
import { openPopupWindow } from '../../../../background/services/helper/index.js'
import type { RequestPayload } from '../database/types.js'

const MAX_UNCONFIRMED_REQUESTS_SIZE = 1
const MAIN_RECORD_ID = '0'

function requestSorter(a: JsonRpcPayload, z: JsonRpcPayload) {
    return (a.id as number) ?? 0 - (z.id as number) ?? 0
}

export async function getUnconfirmedRequests() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('UnconfirmedRequestChunk')
    const chunk = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    if (!chunk) return []
    return chunk.requests.slice(0, MAX_UNCONFIRMED_REQUESTS_SIZE).sort(requestSorter)
}

export async function topUnconfirmedRequest() {
    return first(await getUnconfirmedRequests())
}

export async function pushUnconfirmedRequest(payload: RequestPayload) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    const requests = chunk_?.requests ?? []

    // validate if it's still possible to push a new request
    if (requests.length >= MAX_UNCONFIRMED_REQUESTS_SIZE) {
        await openPopupWindow()
        throw new Error('Unable to add more request.')
    }

    const chunk = chunk_
        ? {
              ...chunk_,
              updatedAt: now,
              requests: requests.concat(payload),
          }
        : {
              record_id: MAIN_RECORD_ID,
              createdAt: now,
              updatedAt: now,
              requests: [payload],
          }
    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    WalletMessages.events.requestsUpdated.sendToAll({ hasRequest: true })
    return payload
}

export async function updateUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)

    if (!chunk_?.requests.length) throw new Error('No request to update.')

    const requests =
        chunk_?.requests?.map((item) => {
            if (item.id !== payload.id) return item
            return payload
        }) ?? []

    const chunk = {
        ...chunk_,
        updatedAt: now,
        requests,
    }

    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    WalletMessages.events.requestsUpdated.sendToAll({ hasRequest: true })
    return payload
}

export async function deleteUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    const requests = (chunk_?.requests ?? []).filter((x) => x.id !== payload.id)
    if (!chunk_) return

    const chunk = {
        ...chunk_,
        updatedAt: now,
        requests,
    }
    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    WalletMessages.events.requestsUpdated.sendToAll({ hasRequest: false })
    return payload
}
