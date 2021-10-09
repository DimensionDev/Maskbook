import { first } from 'lodash-es'
import type { JsonRpcPayload } from 'web3-core-helpers'
import * as database from './database'
import * as HelperService from '../../../../extension/background-script/HelperService'

export async function topUnconfirmedRequest() {
    return first(await database.getUnconfirmedRequests())
}

export async function popUnconfirmedRequest() {
    const topRequest = await topUnconfirmedRequest()
    await database.popUnconfirmedRequest()
    return topRequest
}

export async function pushUnconfirmedRequest(payload: JsonRpcPayload) {
    try {
        await database.pushUnconfirmedRequest(payload)
    } catch (error) {
        await HelperService.openPopupsWindow()
        throw error
    }
    return payload
}

export async function updateUnconfirmedRequest(payload: JsonRpcPayload) {
    await database.updateUnconfirmedRequest(payload)
    return payload
}

export async function deleteUnconfirmedRequest(payload: JsonRpcPayload) {
    await database.removeUnconfirmedRequest(payload)
    return payload
}

export async function clearUnconfirmedRequests() {
    await database.clearUnconfirmedRequests()
}
