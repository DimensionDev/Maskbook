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
let isBackground = () => isEnvironment(Environment.ManifestBackground)
export function __workaround__replaceIsBackground__(f: () => boolean) {
    isBackground = f
}

function getPluginRPCInternal(
    cache: Map<string, object>,
    pluginID: string,
    starter: typeof AsyncCall | typeof AsyncGeneratorCall,
) {
    if (cache.has(pluginID)) return cache.get(pluginID)
    const message = getPluginMessage<RPCMessage>(pluginID, DOMAIN_RPC)
    const rpc = starter(Object.create(null), {
        key: `@plugin/${pluginID}`,
        channel: {
            on: message._.on,
            send: message._.sendToBackgroundPage,
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
    return getPluginRPCInternal(cache, pluginID, AsyncCall) as T
}
export function getPluginRPCGenerator<T>(pluginID: string): T {
    if (isBackground()) startPluginGeneratorRPC(pluginID, new AbortController().signal, Object.create(null))
    return getPluginRPCInternal(cacheGenerator, pluginID, AsyncGeneratorCall) as T
}

function startPluginRPCInternal(
    cache: Map<string, object>,
    pluginID: string,
    signal: AbortSignal,
    impl: object,
    starter: typeof AsyncCall | typeof AsyncGeneratorCall,
) {
    if (!isBackground()) throw new Error('Cannot start RPC in the UI.')
    const message = getPluginMessage<RPCMessage>(pluginID, DOMAIN_RPC)
    const delegate = getOrUpdateLocalImplementationHMR(() => impl, message._)
    if (cache.has(pluginID)) return
    cache.set(pluginID, delegate)
    starter(delegate, {
        key: pluginID,
        channel: {
            on: message._.on,
            send: message._.sendByBroadcast,
        },
        serializer,
        log,
        thenable: false,
    })
}
/** @internal */
export function startPluginRPC(pluginID: string, signal: AbortSignal, impl: object) {
    startPluginRPCInternal(cache, pluginID, signal, impl, AsyncCall)
}
/** @internal */
export function startPluginGeneratorRPC(pluginID: string, signal: AbortSignal, impl: object) {
    startPluginRPCInternal(cacheGenerator, pluginID, signal, impl, AsyncGeneratorCall)
}

interface RPCMessage {
    // RPC
    _: unknown
    // Generator
    $: unknown
}
