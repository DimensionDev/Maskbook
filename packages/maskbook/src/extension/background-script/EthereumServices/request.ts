import { noop } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { INTERNAL_nativeSend, INTERNAL_send, SendOverrides } from './send'
import { hasNativeAPI, nativeAPI } from '../../../utils/native-rpc'
import { EthereumMethodType, ProviderType } from '@masknet/web3-shared'
import { currentProviderSettings } from '../../../plugins/Wallet/settings'
import { Flags } from '../../../utils'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { openPopupsWindow } from '../HelperService'

let id = 0

const unconfirmedCallbackMap = new Map<number, (error: Error | null, response?: JsonRpcResponse) => void>()

function getSendMethod() {
    if (hasNativeAPI && nativeAPI) return INTERNAL_nativeSend
    return INTERNAL_send
}

function getPayloadId(payload: JsonRpcPayload) {
    return typeof payload.id === 'string' ? Number.parseInt(payload.id, 10) : payload.id
}

function isRpcNeedToBeConfirmed(method: EthereumMethodType) {
    return [
        EthereumMethodType.ETH_SIGN,
        EthereumMethodType.PERSONAL_SIGN,
        EthereumMethodType.ETH_SIGN_TYPED_DATA,
        EthereumMethodType.ETH_DECRYPT,
        EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
        EthereumMethodType.ETH_SEND_TRANSACTION,
    ].includes(method)
}

export async function request<T extends unknown>(requestArguments: RequestArguments, overrides?: SendOverrides) {
    return new Promise<T>(async (resolve, reject) => {
        requestSend(
            {
                jsonrpc: '2.0',
                id,
                params: [],
                ...requestArguments,
            },
            (error, response) => {
                if (error || response?.error) reject(error ?? response?.error)
                else resolve(response?.result)
            },
            overrides,
        )
    })
}

export async function requestSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    overrides?: SendOverrides,
) {
    id += 1
    const { providerType = currentProviderSettings.value } = overrides ?? {}
    const payload_ = {
        ...payload,
        id,
    }
    if (
        Flags.v2_enabled &&
        isRpcNeedToBeConfirmed(payload_.method as EthereumMethodType) &&
        providerType === ProviderType.Maskbook
    ) {
        try {
            await WalletRPC.pushUnconfirmedRequest(payload_)
        } catch (error) {
            callback(error instanceof Error ? error : new Error('Failed to add request.'))
            return
        }
        unconfirmedCallbackMap.set(payload_.id, callback)
        return
    }
    getSendMethod()(payload_, callback, overrides)
}

export async function requestSendWithConfirmation(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    overrides?: SendOverrides,
) {
    requestSend(payload, callback, overrides)
    openPopupsWindow()
}

export async function confirmRequest(payload: JsonRpcPayload) {
    const pid = getPayloadId(payload)
    if (!pid) return
    getSendMethod()(payload, unconfirmedCallbackMap.get(pid) ?? noop)
    await WalletRPC.deleteUnconfirmedRequest(payload)
    unconfirmedCallbackMap.delete(pid)
}

export async function rejectRequest(payload: JsonRpcPayload) {
    const pid = getPayloadId(payload)
    if (!pid) return
    await WalletRPC.deleteUnconfirmedRequest(payload)
    unconfirmedCallbackMap.delete(pid)
}
