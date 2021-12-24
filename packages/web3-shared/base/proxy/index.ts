import differenceInSeconds from 'date-fns/differenceInSeconds'
import { first } from 'lodash-unified'
import compareAsc from 'date-fns/compareAsc'
export interface MessageBase {
    id: string
}

export interface RequestMessage extends MessageBase {
    method: string
    params: unknown
    notify?: NotifyFn
}

export interface PayloadMessage extends MessageBase {
    error?: unknown
    results?: unknown[]
}

export interface PollItem<T extends unknown = unknown> {
    createdAt: Date
    notify: NotifyFn
    data: T[]
    done?: boolean
    updatedAt?: Date
    pickedAt?: Date
}

export type NotifyFn = (event: { id: string; done: boolean; error?: unknown }) => void

// todo:
// 1. avoid duplicate instance
// 2. auto reconnection: double check
export class ProviderProxy {
    private readonly _socket: WebSocket
    private readonly _pool: Map<string, PollItem>
    private readonly _notify: NotifyFn

    constructor(point: string, notifyFn: NotifyFn) {
        this._socket = new WebSocket(point)
        this._pool = new Map<string, PollItem>()
        this._notify = notifyFn
    }

    waitingOpen = () => {
        return new Promise<void>((resolve, reject) => {
            this._socket.addEventListener('open', () => resolve())
            this._socket.addEventListener('error', () => reject())
        })
    }

    onMessage = (event: MessageEvent<string>) => {
        console.debug('Message from server ', event.data)
        const { id, results, error } = JSON.parse(event.data) as PayloadMessage
        this.clearPool()
        const itemInPoll = this._pool.get(id)
        if (!itemInPoll) return
        if (error || !id) {
            itemInPoll.notify({ id, done: true, error: error })
        }

        if (!results || results.length === 0) {
            itemInPoll.notify({ id, done: true })
            return
        }
        const updatedAt = new Date()
        const dataInPool = itemInPoll?.data ?? []
        const patchData = [...dataInPool, ...(results ?? [])]
        this._pool.set(id, { ...itemInPoll, updatedAt, data: patchData })
        itemInPoll.notify({ id, done: false })
    }

    registerMessage = () => {
        this._socket.removeEventListener('message', this.onMessage)
        this._socket.addEventListener('message', this.onMessage)
    }

    /**
     * Send request to proxy websocket
     * @param message
     */
    send(message: RequestMessage) {
        const cache = this._pool.get(message.id)
        if (cache && !cache.done) return
        if (cache && !this.isExpired(cache!)) return

        this._socket.send(JSON.stringify(message))
        this._pool.set(message.id, { data: [], createdAt: new Date(), notify: message.notify || this._notify })
    }

    get socket(): WebSocket {
        return this._socket
    }

    getResult<T>(id: string): T[] {
        const item = this._pool.get(id)
        if (!item) return []
        const newItem = { ...item, pickedAt: new Date() }
        this._pool.set(id, newItem)
        return item.data as T[]
    }

    /**
     * Cache is expired
     * @param item cache item
     * @returns boolean
     */
    isExpired(item: PollItem) {
        const now = new Date()
        // lasted update time > 30s
        if (!!item.updatedAt && differenceInSeconds(now, item.updatedAt) > 30) return true

        // lasted pick time > 30s
        return !!item.pickedAt && differenceInSeconds(now, item.pickedAt) > 30
    }

    // TODO: should clear all overed 10
    private clearPool() {
        const entities = Array.from(this._pool.entries())
        if (entities.length <= 10) {
            return
        }

        const firstPick = first(
            entities.sort((a, b) => compareAsc(a[1].pickedAt || a[1].createdAt, b[1].pickedAt || b[1].createdAt)),
        )
        if (!firstPick) return
        this._pool.delete(firstPick[0])
    }
}

// TODO: Production
const DEV = 'wss://hyper-proxy-development.mask-reverse-proxy.workers.dev'

enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

function getProxyWebsocketInstanceWrapper(): (notify: NotifyFn) => Promise<ProviderProxy> {
    let cached: ProviderProxy
    return async (notify: NotifyFn) => {
        const state = cached?.socket.readyState
        if (!cached || state === SocketState.CLOSING || state === SocketState.CLOSED) {
            cached = new ProviderProxy(DEV, notify)
            await cached.waitingOpen()
            cached.registerMessage()
            return cached
        }

        if (cached?.socket.readyState === SocketState.CONNECTING) {
            await cached.waitingOpen()
            cached.registerMessage()
            return cached
        }

        return cached
    }
}

export const getProxyWebsocketInstance = getProxyWebsocketInstanceWrapper()
