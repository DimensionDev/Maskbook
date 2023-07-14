import * as Service from './service.js'
import { AsyncCall, type CallbackBasedChannel } from 'async-call-rpc/full'
import {
    __workaround__replaceImplementationOfCrossIsolationMessage__,
    __workaround__replaceImplementationOfMaskMessage__,
    serializer,
} from '@masknet/shared-base'
import { pluginWorkerReadyPromise } from './ready.js'
import {
    __workaround__replaceImplementationOfCreatePluginMessage__,
    __workaround__replaceIsBackground__,
    type PluginMessageEmitter,
    type PluginMessageEmitterItem,
} from '@masknet/plugin-infra'
import type { Serialization } from '@dimensiondev/holoflows-kit'

/** Only used in SharedWorker mode */
const ports = new Set<MessagePort>()
const messageHandlers = new Map<string, Set<TargetAwareHandler>>()

export type InternalMessage_PluginMessage = [type: string, data: unknown, requirePageVisible?: boolean]

// Plugin Message
{
    function createProxy(initValue: (key: string) => any): any {
        function set(key: string) {
            const value = initValue(key)
            Object.defineProperty(container, key, { value, configurable: true })
            return value
        }
        const container = {
            __proto__: new Proxy(
                { __proto__: null },
                {
                    get(_, key) {
                        if (typeof key === 'symbol') return undefined
                        return set(key)
                    },
                },
            ),
        }
        return new Proxy(container, {
            getPrototypeOf: () => null,
            setPrototypeOf: (_, v) => v === null,
            getOwnPropertyDescriptor: (_, key) => {
                if (typeof key === 'symbol') return undefined
                if (!(key in container)) set(key)
                return Object.getOwnPropertyDescriptor(container, key)
            },
        })
    }

    const cache = new Map<string, PluginMessageEmitter<unknown>>()
    __workaround__replaceIsBackground__(() => true)
    function createEmitter(domain: string, serializer: Serialization | undefined): PluginMessageEmitter<unknown> {
        if (cache.has(domain)) return cache.get(domain)! as PluginMessageEmitter<unknown>

        const listeners = new Map<string, Set<(data: unknown) => void>>()
        addListener(domain, async (message) => {
            const [type, data] = message as InternalMessage_PluginMessage
            dispatchData(type, await de_ser(data))
        })
        function getEventName(name: string) {
            if (!listeners.has(name)) listeners.set(name, new Set())
            return listeners.get(name)!
        }
        function dispatchData(...[type, data]: InternalMessage_PluginMessage) {
            const fns = getEventName(type)
            for (const fn of fns) {
                try {
                    fn(data)
                } catch (error) {
                    console.error(error)
                }
            }
        }
        function ser(data: unknown) {
            if (serializer) return serializer.serialization(data)
            return data
        }
        function de_ser(data: unknown) {
            if (serializer) return serializer.deserialization(data)
            return data
        }
        const emitter = createProxy((eventName) => {
            const value: PluginMessageEmitterItem<unknown> = {
                on(callback, options) {
                    const events = getEventName(eventName)
                    events.add(callback)
                    options?.signal?.addEventListener('abort', () => events.delete(callback), { once: true })
                    return () => events.delete(callback)
                },
                off(callback) {
                    getEventName(eventName).delete(callback)
                },
                async sendToBackgroundPage(data) {
                    dispatchData(eventName, data)
                },
                async sendByBroadcast(data) {
                    broadcastMessage(domain, [eventName, await ser(data)] satisfies InternalMessage_PluginMessage)
                },
                async sendToAll(data) {
                    broadcastMessage(domain, [eventName, await ser(data)] satisfies InternalMessage_PluginMessage)
                    dispatchData(eventName, data)
                },
                sendToLocal(data) {
                    dispatchData(eventName, data)
                },
                async sendToVisiblePages(data) {
                    broadcastMessage(domain, [eventName, await ser(data), true] satisfies InternalMessage_PluginMessage)
                },
            }
            return value
        })
        cache.set(domain, emitter)
        return emitter
    }
    __workaround__replaceImplementationOfCreatePluginMessage__(function (
        pluginID: string,
        serializer: Serialization | undefined,
    ): PluginMessageEmitter<unknown> {
        return createEmitter('plugin:' + pluginID, serializer)
    })
    __workaround__replaceImplementationOfCrossIsolationMessage__(createEmitter('cross-isolation', undefined))
    __workaround__replaceImplementationOfMaskMessage__(createEmitter('mask', serializer))
}

// RPC
{
    const channel: CallbackBasedChannel = {
        setup(jsonRPCHandlerCallback) {
            addListener('rpc', (message, _, response) => {
                jsonRPCHandlerCallback(message).then((data) => response('rpc', data))
            })
        },
    }
    AsyncCall(Service, { channel, log: true, serializer })
}

export type TargetAwareHandler = (
    message: unknown,
    sender: MessagePort | null,
    response: (type: string, value: unknown) => void,
) => void
export function addListener(type: string, handler: TargetAwareHandler) {
    if (!messageHandlers.has(type)) messageHandlers.set(type, new Set())
    const store = messageHandlers.get(type)!
    store.add(handler)
    return () => store.delete(handler)
}

addListener('request-ready', (_, __, response) => {
    pluginWorkerReadyPromise.then(() => response('ready', undefined))
})

export function broadcastMessage(type: string, message: unknown) {
    if (ports.size) {
        ports.forEach((port) => port.postMessage([type, message]))
    } else {
        postMessage([type, message])
    }
}

// shared worker
globalThis.addEventListener('connect', (event) => {
    const port: MessagePort = (event as MessageEvent).ports[0]
    ports.add(port)
    // message send through port is a tuple [type, data]
    port.addEventListener('message', (e) => {
        const [type, data] = e.data
        const handlers = messageHandlers.get(type)
        if (!handlers?.size) return
        for (const f of handlers) {
            f(data, port, (type, value) => port.postMessage([type, value]))
        }
    })
    port.start()
})

// normal worker
globalThis.addEventListener('message', (event) => {
    const [type, data] = event.data
    const handlers = messageHandlers.get(type)
    if (!handlers?.size) return
    for (const f of handlers) {
        f(data, null, (type, value) => globalThis.postMessage([type, value]))
    }
})
