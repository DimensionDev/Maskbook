import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PluginITO_RPC } from '../messages'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { JSON_PayloadInMask } from '../types'

let storage = new Map<string, ValueRef<JSON_PayloadInMask>>()
let storageOfLoading = new Map<string, boolean>()

export function usePoolPayload(pid: string) {
    if (!storageOfLoading.has(pid) || storageOfLoading.get(pid)) throw suspender(pid)
    return {
        payload: useValueRef(storage.get(pid)!),
        retry: () => retry(pid),
    }
}

async function retry(pid: string) {
    storageOfLoading.set(pid, true)
    if (storageOfLoading.get(pid)) throw suspender(pid)
    return
}

async function suspender(pid: string) {
    try {
        storage.set(pid, new ValueRef(await PluginITO_RPC.getPool(pid)))
        storageOfLoading.set(pid, false)
    } catch (error) {
        throw error
    }
}
