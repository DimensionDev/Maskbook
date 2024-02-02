import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { AsyncCall, type AsyncCallLogLevel, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer, getOrUpdateLocalImplementationHMR } from '@masknet/shared-base'
import { getPluginMessage } from '@masknet/plugin-infra'
import { DOMAIN_RPC } from './message.js'

const log: AsyncCallLogLevel = {
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
    sendLocalStack: process.env.NODE_ENV === 'development',
}
function isBackground() {
    return isEnvironment(Environment.ManifestBackground)
}
function getPluginRPCInternal(
    cache: Map<string, object>,
    pluginID: string,
    starter: typeof AsyncCall | typeof AsyncGeneratorCall,
    entry: keyof RPCMessage,
) {
    if (cache.has(pluginID)) return cache.get(pluginID)
    const message = getPluginMessage<RPCMessage>(pluginID, DOMAIN_RPC)
    const rpc = starter(Object.create(null), {
        key: `@plugin/${pluginID}`,
        channel: {
            on: message[entry].on,
            send: message[entry].sendToBackgroundPage,
        },
        serializer,
        log,
        thenable: false,
    })
    cache.set(pluginID, rpc)
    return rpc
}
const cache = new Map<string, object>()
const cacheGenerator = new Map<string, object>()
export function getPluginRPC<T>(pluginID: string): T {
    if (isBackground()) startPluginRPC(pluginID, new AbortController().signal, Object.create(null))
    return getPluginRPCInternal(cache, pluginID, AsyncCall, '_') as T
}
export function getPluginRPCGenerator<T>(pluginID: string): T {
    if (isBackground()) startPluginGeneratorRPC(pluginID, new AbortController().signal, Object.create(null))
    return getPluginRPCInternal(cacheGenerator, pluginID, AsyncGeneratorCall, '$') as T
}

function startPluginRPCInternal(
    cache: Map<string, object>,
    pluginID: string,
    signal: AbortSignal,
    impl: object,
    starter: typeof AsyncCall | typeof AsyncGeneratorCall,
    entry: keyof RPCMessage,
) {
    if (!isBackground()) throw new Error('Cannot start RPC in the UI.')
    const message = getPluginMessage<RPCMessage>(pluginID, DOMAIN_RPC)
    Promise.resolve(impl).catch((error) => {
        console.error('[@masknet/plugin-infra] Background service of plugin', pluginID, 'failed to start.', error)
    })
    const delegate = getOrUpdateLocalImplementationHMR(() => impl, message[entry])
    if (cache.has(pluginID)) return
    cache.set(pluginID, delegate)
    starter(delegate, {
        key: pluginID,
        channel: {
            on: message[entry].on,
            send: message[entry].sendByBroadcast,
        },
        serializer,
        log,
        thenable: false,
    })
}
/** @internal */
export function startPluginRPC(pluginID: string, signal: AbortSignal, impl: object) {
    startPluginRPCInternal(cache, pluginID, signal, impl, AsyncCall, '_')
}
/** @internal */
export function startPluginGeneratorRPC(pluginID: string, signal: AbortSignal, impl: object) {
    startPluginRPCInternal(cacheGenerator, pluginID, signal, impl, AsyncGeneratorCall, '$')
}

interface RPCMessage {
    // RPC
    _: unknown
    // Generator
    $: unknown
}
