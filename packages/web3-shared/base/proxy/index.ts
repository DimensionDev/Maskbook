import differenceInSeconds from 'date-fns/differenceInSeconds'
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

export interface PoolItem<T extends unknown = unknown> {
    createdAt: Date
    notify: NotifyFn
    data: T[]
    done?: boolean
    updatedAt?: Date
    pickedAt?: Date
}

export type OutMessageEvent = { id: string; done: boolean; error?: unknown }
export type NotifyFn = (event: OutMessageEvent) => void

const POOL_CACHE_EXPIRE_TIME = 10

export class ProviderProxy {
    private readonly _socket: WebSocket
    private readonly _pool: Map<string, PoolItem>
    private readonly _globalNotify: NotifyFn

    constructor(point: string, notifyFn: NotifyFn) {
        this._socket = new WebSocket(point)
        this._pool = new Map<string, PoolItem>()
        this._globalNotify = notifyFn
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
        this.clearPool()
        const cache = this._pool.get(message.id)
        if (cache && !cache.done) return
        if (cache && !this.isExpired(cache)) return

        this._socket.send(JSON.stringify(message))
        this._pool.set(message.id, { data: [], createdAt: new Date(), notify: message.notify || this._globalNotify })
    }

    /**
     * Send async request to proxy websocket, Avoid use this method
     * @param message
     */
    async sendAsync<T>(message: RequestMessage) {
        this.clearPool()
        const cache = this._pool.get(message.id)
        if (cache && !this.isExpired(cache!)) return this.getResult<T>(message.id) ?? []

        const innerMessagePromise = () =>
            new Promise<OutMessageEvent>((resolve, reject) => {
                message.notify = (info: OutMessageEvent) => {
                    if (info.done) resolve(info)
                    if (info.error) reject(info)
                }
                this.send(message)
            })
        await innerMessagePromise()

        return this.getResult<T>(message.id) ?? []
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
    isExpired(item: PoolItem) {
        const now = new Date()
        // lasted update time > 30s
        if (!!item.updatedAt && differenceInSeconds(now, item.updatedAt) > POOL_CACHE_EXPIRE_TIME) return true

        // lasted pick time > 30s
        return !!item.pickedAt && differenceInSeconds(now, item.pickedAt) > POOL_CACHE_EXPIRE_TIME
    }

    private clearPool() {
        let beCleaned = []
        const entities = Array.from(this._pool.entries())
        // clear expired
        beCleaned = entities.filter((x) => this.isExpired(x[1]))

        // clear overed size
        if (entities.length > 10) {
            const picks = entities
                .sort((a, b) => compareAsc(a[1].pickedAt || a[1].createdAt, b[1].pickedAt || b[1].createdAt))
                .splice(0, entities.length - 10)
            beCleaned.concat(picks)
        }
        beCleaned.forEach((x) => this._pool.delete(x[0]))
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
    let cachedInstance: ProviderProxy

    const createNewInstance = async (notify: NotifyFn) => {
        cachedInstance = new ProviderProxy(DEV, notify)
        await cachedInstance.waitingOpen()
        cachedInstance.registerMessage()
    }

    return async (notify: NotifyFn) => {
        const state = cachedInstance?.socket.readyState
        if (!cachedInstance || state === SocketState.CLOSING || state === SocketState.CLOSED) {
            await createNewInstance(notify)
            // reconnect when closed
            cachedInstance.socket.addEventListener('close', () => {
                setTimeout(async function () {
                    await createNewInstance(notify)
                }, 1000)
            })
            return cachedInstance
        }

        if (cachedInstance?.socket.readyState === SocketState.CONNECTING) {
            await cachedInstance.waitingOpen()
            cachedInstance.registerMessage()
            return cachedInstance
        }

        return cachedInstance
    }
}

export const getProxyWebsocketInstance = getProxyWebsocketInstanceWrapper()
