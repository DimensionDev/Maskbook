// DO NOT import React in this file. This file is also used by worker.
import type { Subscription } from 'use-subscription'
import { env, type BuildInfoFile } from '@masknet/flags'
import type { Plugin } from '../types.js'

const __registered = new Map<string, Plugin.DeferredDefinition>()
const listeners = new Set<onNewPluginRegisteredListener>()

type onNewPluginRegisteredListener = (id: string, def: Plugin.DeferredDefinition) => void
export function onNewPluginRegistered(f: onNewPluginRegisteredListener) {
    listeners.add(f)
    return () => listeners.delete(f)
}

export const registeredPlugins: Subscription<Array<[string, Plugin.DeferredDefinition]>> = (() => {
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

export function getPluginDefine(id: string) {
    return __registered.get(id)
}

export function registerPlugin(def: Plugin.DeferredDefinition) {
    if (__registered.has(def.ID)) return
    if (!__meetRegisterRequirement(def, env.channel)) return
    __registered.set(def.ID, def as any)
    listeners.forEach((f) => f(def.ID, def as any))
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
