// DO NOT import React in this file. This file is also used by worker.
import { memoize } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { PluginID, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Plugin } from '../types.js'

const __registered = new Map<PluginID, Plugin.DeferredDefinition>()
const listeners = new Set<onNewPluginRegisteredListener>()

export type onNewPluginRegisteredListener = (id: string, def: Plugin.DeferredDefinition) => void
export function onNewPluginRegistered(f: onNewPluginRegisteredListener) {
    listeners.add(f)
    return () => listeners.delete(f)
}

export const registeredPlugins: Subscription<Array<[PluginID, Plugin.DeferredDefinition]>> = (() => {
    let value: any[] | undefined
    onNewPluginRegistered(() => (value = undefined))
    return {
        getCurrentValue() {
            return (value ??= [...__registered.entries()])
        },
        subscribe(callback) {
            return onNewPluginRegistered(callback)
        },
    }
})()

export function getPluginDefine(id: PluginID | NetworkPluginID) {
    return __registered.get(id as unknown as PluginID)
}

export function registerPlugin<
    ChainId = unknown,
    SchemaType = unknown,
    ProviderType = unknown,
    NetworkType = unknown,
    Transaction = unknown,
    TransactionParameter = unknown,
>(def: Plugin.DeferredDefinition<ChainId, SchemaType, ProviderType, NetworkType, Transaction, TransactionParameter>) {
    if (__registered.has(def.ID)) return
    if (!__meetRegisterRequirement(def)) return
    __registered.set(def.ID, def as any)
    listeners.forEach((f) => f(def.ID, def as any))
    getRegisteredWeb3Networks_memo.cache.clear?.()
    getRegisteredWeb3Providers_memo.cache.clear?.()
}

function getRegisteredPluginsSort_EVM_Ahead() {
    return [...__registered.values()].sort(sort_EVM_ahead)
}

function sort_EVM_ahead(a: Plugin.DeferredDefinition, b: Plugin.DeferredDefinition) {
    if (a.ID.includes('evm')) return -1
    if (b.ID.includes('evm')) return 1
    return 0
}
const getRegisteredWeb3Networks_memo = memoize(() => {
    return getRegisteredPluginsSort_EVM_Ahead().flatMap((x) => x.declareWeb3Networks || [])
})
const getRegisteredWeb3Providers_memo = memoize(() => {
    return getRegisteredPluginsSort_EVM_Ahead().flatMap((x) => x.declareWeb3Providers || [])
})

export function getRegisteredWeb3Networks() {
    return getRegisteredWeb3Networks_memo() as Web3Helper.NetworkDescriptorAll[]
}

export function getRegisteredWeb3Providers() {
    return getRegisteredWeb3Providers_memo() as Web3Helper.ProviderDescriptorAll[]
}

function __meetRegisterRequirement(def: Plugin.Shared.Definition) {
    // build variant check
    if (process.env.NODE_ENV === 'production') {
        try {
            if (process.env.channel === 'stable' && def.enableRequirement.target !== 'stable') {
                return false
            } else if (process.env.channel === 'beta' && def.enableRequirement.target === 'insider') {
                return false
            }
        } catch {
            // process.env.channel might not be possible in each build environment.
            if (def.enableRequirement.target !== 'stable') return false
        }
    }
    return true
}
