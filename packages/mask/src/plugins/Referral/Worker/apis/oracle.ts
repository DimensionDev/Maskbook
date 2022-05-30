import type { JsonRpcResponse } from 'web3-core-helpers'

import { getFarmOraclesDiscovery } from './discovery'
import { supportedOracleChainId } from '../../constants'

export enum RpcRoute {
    rpc = 'rpc',
    recommendations = 'recommendations/rpc',
}

export enum RpcMethod {
    oracle_chainId = 'oracle_chainId',
    oracle_getDerivedBlockByHash = 'oracle_getDerivedBlockByHash',
    oracle_getBundleReceipt = 'oracle_getBundleReceipt',
    oracle_getDerivedBlockByNumber = 'oracle_getDerivedBlockByNumber',
    oracle_getOperationalAddress = 'oracle_getOperationalAddress',
    oracle_call = 'oracle_call',
    oracle_getLogs = 'oracle_getLogs',
}

export enum RecommendationsRpcMethod {
    oracle_getOperationalAddress = 'oracle_getOperationalAddress',
    oracle_getTimePromise = 'oracle_getTimePromise',
    oracle_sendProofOfRecommendationOrigin = 'oracle_sendProofOfRecommendationOrigin',
    oracle_sendProofOfRecommendation = 'oracle_sendProofOfRecommendation',
    oracle_getProofOfRecommendationOrigin = 'oracle_getProofOfRecommendationOrigin',
}

export async function getOracle(): Promise<string> {
    const {
        discovery: { oracles },
    } = await getFarmOraclesDiscovery()

    return oracles.find((oracle) => oracle.chainId === supportedOracleChainId)?.url ?? ''
}

export async function jsonReq(url: string, opts: any) {
    if (!opts?.headers) opts.headers = {}

    Object.assign(opts.headers, { 'content-type': 'application/json' })
    const res = await fetch(url, opts)

    if (res.status !== 200) {
        throw new Error(res.statusText)
    }

    const json: JsonRpcResponse = await res.json()
    if (json.error) {
        throw new Error(`Code: ${json.error.code}. ${json.error?.message || ''}`)
    }

    return json
}

/**
 *
 * @param url url
 * @param method get/post/put
 * @param params params
 * @returns result of request
 */
export async function rpcCall(url: string, method: string, params: any) {
    const res = await jsonReq(url, {
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: crypto.randomUUID(),
            method,
            params: params || [],
        }),
    })

    return res
}
