// DO NOT import React in this file. This file is also used by worker.
import { memoize } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { env, type BuildInfoFile } from '@masknet/flags'
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
    RequestArguments = unknown,
    RequestOptions = unknown,
    Transaction = unknown,
    TransactionParameter = unknown,
>(
    def: Plugin.DeferredDefinition<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        RequestArguments,
        RequestOptions,
        Transaction,
        TransactionParameter
    >,
) {
    if (__registered.has(def.ID)) return
    if (!__meetRegisterRequirement(def, env.channel)) return
    __registered.set(def.ID, def as any)
    listeners.forEach((f) => f(def.ID, def as any))
    getRegisteredWeb3Networks_memo.cache.clear?.()
    getRegisteredWeb3Providers_memo.cache.clear?.()
}

function getRegisteredPlugin(ID: NetworkPluginID) {
    const pluginID = ID as unknown as PluginID
    return [...__registered.values()].find((x) => x.ID === pluginID)
}
const getRegisteredWeb3Chains_memo = memoize((ID: NetworkPluginID) => {
    return getRegisteredPlugin(ID)?.declareWeb3Chains ?? []
})
const getRegisteredWeb3Networks_memo = memoize((ID: NetworkPluginID) => {
    return getRegisteredPlugin(ID)?.declareWeb3Networks ?? []
})
const getRegisteredWeb3Providers_memo = memoize((ID: NetworkPluginID) => {
    return getRegisteredPlugin(ID)?.declareWeb3Providers ?? []
})

export function getRegisteredWeb3Chains<T extends NetworkPluginID>(ID: T) {
    return getRegisteredWeb3Chains_memo(ID) as Array<Web3Helper.ChainDescriptorScope<void, T>>
}

export function getRegisteredWeb3Networks<T extends NetworkPluginID>(ID: T) {
    return getRegisteredWeb3Networks_memo(ID) as Array<Web3Helper.NetworkDescriptorScope<void, T>>
}

export function getRegisteredWeb3Providers<T extends NetworkPluginID>(ID: T) {
    return getRegisteredWeb3Providers_memo(ID) as Array<Web3Helper.ProviderDescriptorScope<void, T>>
}

function __meetRegisterRequirement(def: Plugin.Shared.Definition, currentChannel: BuildInfoFile['channel']) {
    // build variant check
    if (process.env.NODE_ENV === 'production') {
        if (currentChannel === 'stable' && def.enableRequirement.target !== 'stable') {
            return false
        } else if (currentChannel === 'beta' && def.enableRequirement.target === 'insider') {
            return false
        }
    }
    return true
}
