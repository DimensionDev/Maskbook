import { sha3 } from 'web3-utils'
import type { TransactionConfig } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { EthereumMethodType, ChainId, type RequestArguments } from '@masknet/web3-shared-evm'
import { fetchSquashedJSON } from './fetchJSON.js'

function createRequestID(chainId: ChainId, requestArguments: RequestArguments) {
    const { method, params } = requestArguments
    switch (method) {
        case EthereumMethodType.ETH_GET_CODE: {
            const [address, tag = 'latest'] = params as [string, string]
            return sha3([chainId, method, address, tag].join(','))
        }
        case EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER: {
            const [number, full] = params as [string, boolean]
            return sha3([chainId, method, number, full].join(','))
        }
        case EthereumMethodType.ETH_BLOCK_NUMBER: {
            return sha3([chainId, method].join(','))
        }
        case EthereumMethodType.ETH_GET_BALANCE:
        case EthereumMethodType.ETH_GET_TRANSACTION_COUNT:
            const [account, tag = 'latest'] = params as [string, string]
            return sha3([chainId, method, account, tag].join(','))
        case EthereumMethodType.ETH_CALL:
        case EthereumMethodType.ETH_ESTIMATE_GAS: {
            const [config, tag = 'latest'] = params as [TransactionConfig, string]
            return sha3([chainId, method, JSON.stringify(config), tag].join(','))
        }
        case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
        case EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH:
            const [hash] = params as [string]
            return sha3([chainId, method, hash].join(','))
        default:
            return
    }
}

async function getChainIdFromRequest(request: Request) {
    const url = request.url
    const body: JsonRpcPayload = await request.json()

    console.log('DEBUG: getChainIdFromRequest')
    console.log({
        url,
        body,
        id: createRequestID(ChainId.Mainnet, {
            method: body.method as EthereumMethodType,
            params: body.params as [],
        }),
    })

    // TODO: chainId should be computed from the request url
    return ChainId.Mainnet
}

async function resolveRequestKey(request: Request) {
    try {
        const body: JsonRpcPayload = await request.json()

        return (
            createRequestID(await getChainIdFromRequest(request), {
                method: body.method as EthereumMethodType,
                params: body.params ?? [],
            }) ?? ''
        )
    } catch {
        return ''
    }
}

export async function fetchJsonRpcResponse(url: string, payload: JsonRpcPayload, init?: RequestInit) {
    return fetchSquashedJSON<JsonRpcResponse>(
        url,
        {
            ...init,
            method: 'POST',
            headers: init?.headers ?? {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
        {
            resolver: resolveRequestKey,
        },
    )
}
