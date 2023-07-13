import type { Serialization } from '@dimensiondev/holoflows-kit'
import { defer } from '@masknet/kit'
import {
    __workaround__replaceImplementationOfCreatePluginMessage__,
    type PluginMessageEmitter,
    type PluginMessageEmitterItem,
} from '@masknet/plugin-infra'
import type { InternalMessage_PluginMessage } from '../background-worker/message.js'
import {
    __workaround__replaceImplementationOfCrossIsolationMessage__,
    __workaround__replaceImplementationOfMaskMessage__,
    serializer,
} from '@masknet/shared-base'
export type MessageHandler = (message: any) => void
export let postMessage: (type: string, data: unknown) => void
const messageHandlers = new Map<string, Set<MessageHandler>>()

function MessageEventReceiver(event: MessageEvent): void {
    const [type, data] = event.data
    const handler = messageHandlers.get(type)
    if (!handler?.size) return
    for (const h of handler) h(data)
}
if (typeof SharedWorker === 'function') {
    const worker = new SharedWorker(new URL('../background-worker/index.ts', import.meta.url), {
        name: 'mask plugin worker',
    })
    worker.port.addEventListener('message', MessageEventReceiver)
    worker.port.start()
    postMessage = (type: string, data: unknown) => worker.port.postMessage([type, data])
} else {
    const worker = new Worker(new URL('../background-worker/index.ts', import.meta.url), {
        name: 'mask plugin worker',
    })
    worker.addEventListener('message', MessageEventReceiver)
    postMessage = (type: string, data: unknown) => worker.postMessage([type, data])
}

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

    function createEmitter(domain: string, serializer: Serialization | undefined) {
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
        function dispatchData(...[type, data, requirePageVisible]: InternalMessage_PluginMessage) {
            if (requirePageVisible && document.visibilityState === 'hidden') return
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
                on(callback) {
                    const events = getEventName(eventName)
                    events.add(callback)
                    return () => events.delete(callback)
                },
                off(callback) {
                    getEventName(eventName).delete(callback)
                },
                async sendByBroadcast(data) {
                    postMessage(domain, [eventName, await ser(data)] satisfies InternalMessage_PluginMessage)
                },
                async sendToAll(data) {
                    postMessage(domain, [eventName, await ser(data)] satisfies InternalMessage_PluginMessage)
                    dispatchData(eventName, data)
                },
                async sendToBackgroundPage(data) {
                    postMessage(domain, [eventName, await ser(data)] satisfies InternalMessage_PluginMessage)
                },
                sendToLocal(data) {
                    dispatchData(eventName, data)
                },
                async sendToVisiblePages(data) {
                    if (document.visibilityState === 'visible') dispatchData(eventName, data)
                    postMessage(domain, [eventName, await ser(data), true] satisfies InternalMessage_PluginMessage)
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

// Ensure plugin host is ready by blocking this file
{
    const [promise, resolve] = defer<void>()
    const removeListener = addListener('ready', () => {
        removeListener()
        resolve()
    })
    postMessage('request-ready', null)
    await promise
}

export function addListener(type: string, callback: MessageHandler) {
    if (!messageHandlers.has(type)) messageHandlers.set(type, new Set())
    const store = messageHandlers.get(type)!
    store.add(callback)
    return () => store.delete(callback)
}
