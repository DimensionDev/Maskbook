import type { JsonRpcResponse } from 'web3-core-helpers'

import { getFarmOraclesDiscovery } from './discovery'
import { supportedOracleChainId } from '../../constants'

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
 * @param host url of the Oracle
 * @param method get/post/put
 * @param params params
 * @param porRequest true if this is Proof of Recommendations request (requires different route for max uptime)
 * @returns result of request
 */
 export async function rpcCall(host: string, method: string, params: any, porRequest = false) {
    const url = porRequest ? `${host}/v1/rpc` : `${host}/v1/recommendations/rpc`
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

