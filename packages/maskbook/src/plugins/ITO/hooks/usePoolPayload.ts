import { PluginITO_RPC } from '../messages'
import type { JSON_PayloadInMask } from '../types'

const storage = new Map<string, JSON_PayloadInMask | Error>()

export function usePoolPayload(pid: string) {
    if (!storage.has(pid)) throw suspender(pid)
    return {
        payload: storage.get(pid)!,
        retry: () => retry(pid),
    }
}

async function retry(pid: string) {
    storage.delete(pid)
    if (!storage.has(pid)) throw suspender(pid)
    return
}

async function suspender(pid: string) {
    try {
        storage.set(pid, await PluginITO_RPC.getPool(pid))
    } catch (error) {
        storage.set(pid, new Error())
    }
}
