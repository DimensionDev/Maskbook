// DO NOT import React in this file. This file is also used by worker.
import type { Plugin, PluginID } from '../types.js'
import { memoize } from 'lodash-unified'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Subscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const __registered = new Map<PluginID, Plugin.DeferredDefinition>()
const listeners = new Set<onNewPluginRegisteredListener>()

export type onNewPluginRegisteredListener = (id: string, def: Plugin.DeferredDefinition) => void
export function onNewPluginRegistered(f: onNewPluginRegisteredListener) {
    listeners.add(f)
    return () => listeners.delete(f)
}

export const registeredPlugins: Subscription<Array<[PluginID, Plugin.DeferredDefinition]>> = {
    getCurrentValue() {
        return Array.from(__registered.entries())
    },
    subscribe(callback) {
        return onNewPluginRegistered(callback)
    },
}

export function getPluginDefine(id: PluginID | NetworkPluginID) {
    return __registered.get(id as unknown as PluginID)
}

export function registerPlugin<
    ChainId = unknown,
    SchemaType = unknown,
    ProviderType = unknown,
    NetworkType = unknown,
    Signature = unknown,
    GasOption = unknown,
    Block = unknown,
    Operation = unknown,
    Transaction = unknown,
    TransactionReceipt = unknown,
    TransactionDetailed = unknown,
    TransactionSignature = unknown,
    TransactionParameter = unknown,
    Web3 = unknown,
>(
    def: Plugin.DeferredDefinition<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        Signature,
        GasOption,
        Block,
        Operation,
        Transaction,
        TransactionReceipt,
        TransactionDetailed,
        TransactionSignature,
        TransactionParameter,
        Web3
    >,
) {
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
    // arch check
    if (process.env.architecture === 'app' && !def.enableRequirement.architecture.app) return false
    if (process.env.architecture === 'web' && !def.enableRequirement.architecture.web) return false

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
