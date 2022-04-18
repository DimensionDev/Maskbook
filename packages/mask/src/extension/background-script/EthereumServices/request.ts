import type { RequestArguments, TransactionConfig } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import {
    EthereumMethodType,
    EthereumTransactionConfig,
    formatGweiToWei,
    formatWeiToGwei,
    isEIP1559Supported,
    ProviderType,
    RequestOptions,
    SendOverrides,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
import {
    currentChainIdSettings,
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
    currentProviderSettings,
} from '../../../plugins/Wallet/settings'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { INTERNAL_nativeSend, INTERNAL_send } from './send'
import { defer } from '@dimensiondev/kit'
import { hasNativeAPI, nativeAPI } from '../../../../shared/native-rpc'
import { openPopupWindow, removePopupWindow } from '../../../../background/services/helper'
import { toHex } from 'web3-utils'
import { isLessThan } from '@masknet/web3-shared-base'

let id = 0

const UNCONFIRMED_CALLBACK_MAP = new Map<number, (error: Error | null, response?: JsonRpcResponse) => void>()
const RISK_METHOD_LIST = [
    EthereumMethodType.ETH_SIGN,
    EthereumMethodType.PERSONAL_SIGN,
    EthereumMethodType.ETH_SIGN_TYPED_DATA,
    EthereumMethodType.ETH_DECRYPT,
    EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
    EthereumMethodType.ETH_SEND_TRANSACTION,
]

function getSendMethod() {
    if (hasNativeAPI && nativeAPI) return INTERNAL_nativeSend
    return INTERNAL_send
}

function getPayloadId(payload: JsonRpcPayload) {
    return typeof payload.id === 'string' ? Number.parseInt(payload.id, 10) : payload.id
}

function isRiskMethod(method: EthereumMethodType) {
    return RISK_METHOD_LIST.includes(method)
}

function isSendMethod(method: EthereumMethodType) {
    return method === EthereumMethodType.ETH_SEND_TRANSACTION
}

async function requestSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    id += 1
    const notifyProgress = isSendMethod(payload.method as EthereumMethodType)
    const { providerType = currentProviderSettings.value } = overrides ?? {}

    const chainId =
        overrides?.chainId ??
        (providerType === ProviderType.MaskWallet
            ? currentMaskWalletChainIdSettings.value
            : currentChainIdSettings.value)

    const { popupsWindow = true } = options ?? {}

    const payload_ = {
        ...payload,
        id,
    }

    if (payload_.method === EthereumMethodType.ETH_SEND_TRANSACTION) {
        const [config] = payload_.params as [EthereumTransactionConfig]

        // If the default gas config be less than low option, force reset it
        if (isEIP1559Supported(chainId)) {
            const results = await WalletRPC.getEstimateGasFees(chainId)

            if (
                results?.low?.suggestedMaxFeePerGas &&
                results?.medium &&
                (isLessThan(
                    config?.maxFeePerGas ? formatWeiToGwei(config.maxFeePerGas) : 0,
                    results.low.suggestedMaxFeePerGas,
                ) ||
                    isLessThan(
                        config?.maxPriorityFeePerGas ? formatWeiToGwei(config.maxPriorityFeePerGas) : 0,
                        results.low.suggestedMaxPriorityFeePerGas,
                    ))
            ) {
                payload_.params![0] = {
                    ...config,
                    maxFeePerGas: toHex(formatGweiToWei(results.medium.suggestedMaxFeePerGas).toFixed(0)),
                    maxPriorityFeePerGas: toHex(
                        formatGweiToWei(results.medium.suggestedMaxPriorityFeePerGas).toFixed(0),
                    ),
                }
            }
        } else {
            const results = await WalletRPC.getGasPriceDictFromDeBank(chainId)
            if (results?.data.slow.price && isLessThan((config?.gasPrice as string) ?? 0, results.data.slow.price)) {
                payload_.params![0] = {
                    ...config,
                    gasPrice: toHex(results.data.normal.price),
                }
            }
        }
    }

    const hijackedCallback = (error: Error | null, response?: JsonRpcResponse) => {
        if (error && notifyProgress)
            WalletRPC.notifyPayloadProgress(payload_, {
                type: TransactionStateType.FAILED,
                error,
            })
        callback(error, response)
    }

    // redirect risk rpc to the mask wallet
    if (
        !hasNativeAPI &&
        providerType === ProviderType.MaskWallet &&
        isRiskMethod(payload_.method as EthereumMethodType)
    ) {
        try {
            if (notifyProgress)
                WalletRPC.addProgress({
                    payload: payload_,
                    state: {
                        type: TransactionStateType.WAIT_FOR_CONFIRMING,
                    },
                })
            await WalletRPC.pushUnconfirmedRequest(payload_)
        } catch (error) {
            hijackedCallback(error instanceof Error ? error : new Error('Failed to add request.'))
            return
        }
        UNCONFIRMED_CALLBACK_MAP.set(payload_.id, hijackedCallback)
        if (popupsWindow) openPopupWindow()
        return
    }
    if (notifyProgress)
        WalletRPC.addProgress({
            payload,
            state: {
                type:
                    providerType === ProviderType.MaskWallet
                        ? TransactionStateType.UNKNOWN
                        : TransactionStateType.WAIT_FOR_CONFIRMING,
            },
        })
    getSendMethod()(payload_, hijackedCallback, overrides)
}

export async function request<T extends unknown>(
    requestArguments: RequestArguments,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
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
            options,
        )
    })
}

export async function confirmRequest(payload: JsonRpcPayload, disableClose?: boolean) {
    const pid = getPayloadId(payload)
    if (!pid) return
    const [deferred, resolve, reject] = defer<JsonRpcResponse | undefined, Error>()
    getSendMethod()(
        payload,
        (error, response) => {
            UNCONFIRMED_CALLBACK_MAP.get(pid)?.(error, response)
            if (error) reject(error)
            else if (response?.error) reject(new Error(`Failed to send transaction: ${response.error}`))
            else {
                WalletRPC.deleteUnconfirmedRequest(payload)
                    .then(() => {
                        if (disableClose) return
                        return removePopupWindow()
                    })
                    .then(() => {
                        UNCONFIRMED_CALLBACK_MAP.delete(pid)
                    })
                resolve(response)
            }
        },
        {
            account: currentMaskWalletAccountSettings.value,
            chainId: currentMaskWalletChainIdSettings.value,
            providerType: ProviderType.MaskWallet,
        },
    )
    return deferred
}

export async function rejectRequest(payload: JsonRpcPayload) {
    const pid = getPayloadId(payload)
    if (!pid) return
    UNCONFIRMED_CALLBACK_MAP.get(pid)?.(new Error('User rejected!'))
    await WalletRPC.deleteUnconfirmedRequest(payload)
    await removePopupWindow()
    UNCONFIRMED_CALLBACK_MAP.delete(pid)
}

export async function replaceRequest(hash: string, payload: JsonRpcPayload, overrides?: TransactionConfig) {
    const pid = getPayloadId(payload)
    if (!pid || payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

    const [config] = payload.params as [TransactionConfig]
    return request<string>(
        {
            method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
            params: [
                hash,
                {
                    ...config,
                    ...overrides,
                },
            ],
        },
        {
            account: currentMaskWalletAccountSettings.value,
            chainId: currentMaskWalletChainIdSettings.value,
            providerType: ProviderType.MaskWallet,
        },
    )
}

export async function cancelRequest(hash: string, payload: JsonRpcPayload, overrides?: TransactionConfig) {
    const pid = getPayloadId(payload)
    if (!pid || payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

    const [config] = payload.params as [TransactionConfig]
    return replaceRequest(hash, payload, {
        ...config,
        ...overrides,
        to: config.from as string,
        data: '0x',
        value: '0x0',
    })
}
