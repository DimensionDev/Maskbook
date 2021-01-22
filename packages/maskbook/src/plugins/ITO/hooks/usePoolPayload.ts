import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PluginITO_RPC } from '../messages'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { JSON_PayloadInMask } from '../types'

const storage = new Map<string, ValueRef<JSON_PayloadInMask>>()

export function usePoolPayload(pid: string) {
    if (!storage.has(pid)) throw suspender(pid)
    return {
        payload: useValueRef(storage.get(pid)!),
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
        storage.set(pid, new ValueRef(await PluginITO_RPC.getPool(pid)))
    } catch (error) {
        throw error
    }
}
