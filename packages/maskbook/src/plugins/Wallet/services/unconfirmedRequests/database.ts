import { WalletMessages } from '@masknet/plugin-wallet'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { PluginDB } from '../../database/Plugin.db'

const MAX_UNCONFIRMED_REQUESTS_SIZE = 1
const RECORD_ID = '0'

function getRecordId() {
    return RECORD_ID
}

function requestSorter(a: JsonRpcPayload, z: JsonRpcPayload) {
    return (a.id as number) ?? 0 - (z.id as number) ?? 0
}

export async function getUnconfirmedRequests() {
    const chunk = await PluginDB.get('unconfirmed-requests', getRecordId())
    return chunk?.requests?.slice(0, MAX_UNCONFIRMED_REQUESTS_SIZE).sort(requestSorter) ?? []
}

export async function pushUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const chunk = await PluginDB.get('unconfirmed-requests', getRecordId())
    const requests = chunk?.requests ?? []

    if (requests.length >= MAX_UNCONFIRMED_REQUESTS_SIZE) throw new Error('Unable to add more request.')

    if (chunk?.requests.some((x) => x.id === payload.id)) throw new Error('Request already exists.')

    await PluginDB.add({
        type: 'unconfirmed-requests',
        id: getRecordId(),
        requests: requests.concat(payload),
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.unconfirmedRequestsUpdated.sendToAll({ hasRequest: true })
}

export async function popUnconfirmedRequest() {
    const now = new Date()
    const chunk = await PluginDB.get('unconfirmed-requests', getRecordId())
    const requests = chunk?.requests ?? []

    if (!chunk) return
    if (!requests.length) return

    await PluginDB.add({
        type: 'unconfirmed-requests',
        id: getRecordId(),
        requests: requests.slice(1),
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.unconfirmedRequestsUpdated.sendToAll({ hasRequest: false })
}

export async function updateUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const chunk = await PluginDB.get('unconfirmed-requests', getRecordId())

    if (!chunk?.requests.length) throw new Error('No request to update.')

    await PluginDB.add({
        type: 'unconfirmed-requests',
        id: getRecordId(),
        requests:
            chunk?.requests?.map((item) => {
                if (item.id !== payload.id) return item
                return payload
            }) ?? [],
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.unconfirmedRequestsUpdated.sendToAll({ hasRequest: true })
}

export async function removeUnconfirmedRequest(payload: JsonRpcPayload) {
    const now = new Date()
    const chunk = await PluginDB.get('unconfirmed-requests', getRecordId())

    if (!chunk) return

    await PluginDB.add({
        type: 'unconfirmed-requests',
        id: getRecordId(),
        requests: chunk?.requests.filter((x) => x.id !== payload.id) ?? [],
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.unconfirmedRequestsUpdated.sendToAll({ hasRequest: false })
}

export async function clearUnconfirmedRequests() {
    const now = new Date()
    const chunk = await PluginDB.get('unconfirmed-requests', getRecordId())

    if (!chunk) return

    await PluginDB.add({
        type: 'unconfirmed-requests',
        id: getRecordId(),
        requests: [],
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.unconfirmedRequestsUpdated.sendToAll({ hasRequest: false })
}
