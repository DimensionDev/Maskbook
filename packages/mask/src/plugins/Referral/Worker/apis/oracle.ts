import type { JsonRpcResponse } from 'web3-core-helpers'

import { getFarmOraclesDiscovery } from './discovery'

export async function getOracle(): Promise<string> {
    const {
        discovery: { oracles },
    } = await getFarmOraclesDiscovery()

    return oracles[Math.floor(Math.random() * oracles.length)].url
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

export async function rpcCall(host: string, method: string, params: any) {
    const res = await jsonReq(`${host}/v1/rpc`, {
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
