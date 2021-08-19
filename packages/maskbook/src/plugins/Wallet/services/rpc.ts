import { first } from 'lodash'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'

const MAX_UNCONFIRMED_REQUESTS_SIZE = 5
const MAIN_RECORD_ID = '0'

export async function getUncofirmedRequests() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('UnconfirmedRequestChunk')
    const chunk = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    if (!chunk) return []
    return chunk.requests.slice(0, MAX_UNCONFIRMED_REQUESTS_SIZE) ?? []
}

export async function topUnconfirmedRequest() {
    return first(await getUncofirmedRequests())
}

export async function popUnconfirmedRequest() {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    const requests = (chunk_?.requests ?? []).sort((a, z) => (a.id as number) ?? 0 - (z.id as number) ?? 0)
    if (!chunk_) return
    if (!requests.length) return

    const payload = first(requests)
    const chunk = {
        ...chunk_,
        updatedAt: now,
        requests: requests.slice(1),
    }
    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    WalletMessages.events.requestsUpdated.sendToAll(undefined)
    return payload
}

export async function pushUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    const requests = chunk_?.requests ?? []

    // validate if it's still possible to push a new request
    if (requests.length >= MAX_UNCONFIRMED_REQUESTS_SIZE) throw new Error('Unable to add more request.')
    if (requests.some((x) => x.method === payload.method)) throw new Error('Already exists.')

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
    WalletMessages.events.requestsUpdated.sendToAll(undefined)
}

export async function deleteUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    const requests = (chunk_?.requests ?? []).filter((x) => x.id !== payload.id)
    if (!chunk_) return
    if (!requests.length) return

    const chunk = {
        ...chunk_,
        updatedAt: now,
        requests: requests,
    }
    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    WalletMessages.events.requestsUpdated.sendToAll(undefined)
}

export async function clearUnconfirmedRequests() {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('UnconfirmedRequestChunk')

    const chunk_ = await t.objectStore('UnconfirmedRequestChunk').get(MAIN_RECORD_ID)
    const requests = chunk_?.requests ?? []
    if (!chunk_) return
    if (!requests.length) return

    const chunk = {
        ...chunk_,
        updatedAt: now,
        requests: [],
    }
    await t.objectStore('UnconfirmedRequestChunk').put(chunk)
    WalletMessages.events.requestsUpdated.sendToAll(undefined)
}
