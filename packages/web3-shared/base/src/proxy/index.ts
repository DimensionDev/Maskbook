import differenceInSeconds from 'date-fns/differenceInSeconds'
import compareAsc from 'date-fns/compareAsc'
import ReconnectingWebSocket from 'reconnecting-websocket'

export interface MessageBase {
    id: string
}

export interface RequestMessage extends MessageBase {
    method: string
    params: {
        pageSize: number
    } & any
    notify?: NotifyFn
}

export interface PayloadMessage<T extends unknown = unknown> extends MessageBase {
    error?: unknown
    results?: T[]
}

export interface SocketPoolItem<T extends unknown = unknown> {
    createdAt: Date
    notify: NotifyFn
    data: T[]
    done?: boolean
    updatedAt?: Date
    pickedAt?: Date
}

export type OutMessageEvent = { id: string; done: boolean; error?: unknown; from: 'cache' | 'remote' }
export type NotifyFn = (event: OutMessageEvent) => void

const POOL_CACHE_EXPIRE_TIME = 30
const POOL_CACHE_MAX_CAPACITY = 10

export class ProviderProxy {
    private readonly _socket: ReconnectingWebSocket
    private readonly _pool: Map<string, SocketPoolItem>
    private readonly _globalNotify?: NotifyFn

    constructor(point: string, notifyFn?: NotifyFn) {
        this._socket = new ReconnectingWebSocket(point, undefined, { minUptime: 20000 })
        this._pool = new Map<string, SocketPoolItem>()
        this._globalNotify = notifyFn
    }

    waitingOpen = () => {
        return new Promise<void>((resolve, reject) => {
            this._socket.addEventListener('open', () => resolve())
            this._socket.addEventListener('error', () => reject())
        })
    }

    onMessage = (event: MessageEvent<string>) => {
        const { id, results, error } = JSON.parse(event.data) as PayloadMessage
        const itemInPoll = this._pool.get(id)

        if (!itemInPoll) return
        if (error || !id) {
            itemInPoll.notify({ id, done: true, error, from: 'remote' })
        }

        const updatedAt = new Date()
        if (!results || results.length === 0) {
            this._pool.set(id, { ...itemInPoll, done: true })
            itemInPoll.notify({ id, done: true, from: 'remote' })
            return
        }
        const dataInPool = itemInPoll?.data ?? []
        const patchData = [...dataInPool, ...(results ?? [])]
        this._pool.set(id, { ...itemInPoll, updatedAt, data: patchData })
        itemInPoll.notify({ id, done: false, from: 'remote' })
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
        if (cache && !this.isExpired(cache)) {
            const notify = message.notify || this._globalNotify!
            notify({ id: message.id, done: true, from: 'cache' })
            return
        }

        this._socket.send(JSON.stringify({ id: message.id, method: message.method, params: message.params }))
        this._pool.set(message.id, { data: [], createdAt: new Date(), notify: message.notify || this._globalNotify! })
    }

    /**
     * Send async request to proxy websocket, Avoid use this method
     * @param message
     */
    async sendAsync<T>(message: Omit<RequestMessage, 'notify'>) {
        this.clearPool()
        const cache = this._pool.get(message.id)
        if (cache && !this.isExpired(cache!)) return this.getResult<T>(message.id) ?? []

        const innerMessagePromise = () =>
            new Promise<OutMessageEvent>((resolve, reject) => {
                ;(message as RequestMessage).notify = (info: OutMessageEvent) => {
                    if (info.done) resolve(info)
                    if (info.error) reject(info)
                }
                this.send(message as RequestMessage)
            })
        await innerMessagePromise()

        return this.getResult<T>(message.id) ?? []
    }

    get socket(): ReconnectingWebSocket {
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
    isExpired(item: SocketPoolItem) {
        const now = new Date()
        return !!item.updatedAt && differenceInSeconds(now, item.updatedAt) > POOL_CACHE_EXPIRE_TIME
    }

    private clearPool() {
        let beCleaned = []
        const entities = Array.from(this._pool.entries())
        // clear expired
        beCleaned = entities.filter((x) => this.isExpired(x[1]))

        // clear overed size
        if (entities.length > POOL_CACHE_MAX_CAPACITY) {
            const picks = entities
                .sort((a, b) => compareAsc(a[1].pickedAt || a[1].createdAt, b[1].pickedAt || b[1].createdAt))
                .slice(0, entities.length - POOL_CACHE_MAX_CAPACITY)
            beCleaned = [...beCleaned, ...picks]
        }
        beCleaned.forEach((x) => this._pool.delete(x[0]))
    }
}

const SOCKET_POINT =
    // workaround, should create a stage env for QA testing
    process.env.NODE_ENV === 'production' && process.env.channel === 'stable'
        ? 'wss://hyper-proxy-production.mask-reverse-proxy.workers.dev'
        : 'wss://hyper-proxy-development.mask-reverse-proxy.workers.dev'

enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

/**
 * Provider a ProxySocket instance
 * @returns a function to operate socket instance
 */
function getProxyWebsocketInstanceWrapper(): (notify?: NotifyFn) => Promise<ProviderProxy> {
    let cachedInstance: ProviderProxy

    const createNewInstance = async (notify?: NotifyFn) => {
        cachedInstance = new ProviderProxy(SOCKET_POINT, notify)
        await cachedInstance.waitingOpen()
        cachedInstance.registerMessage()
    }

    return async (notify?: NotifyFn) => {
        if (cachedInstance) return cachedInstance
        await createNewInstance(notify)
        return cachedInstance
    }
}

export const getProxyWebsocketInstance = getProxyWebsocketInstanceWrapper()

/**
 * Provide a websocket instance for once, avoid use it.
 * @param endPoint websocket endpoint
 * @returns websocket instance
 */
export const getWebSocketInstance = async (endPoint?: string) => {
    const socket = new WebSocket(endPoint ?? SOCKET_POINT)
    const waitingOpen = () => {
        return new Promise<void>((resolve, reject) => {
            socket.addEventListener('open', () => resolve())
            socket.addEventListener('error', () => reject())
        })
    }
    await waitingOpen()
    return socket
}

/**
 * Provide a websocket instance for once, avoid use it.
 * @param message endPoint
 * @param [endPoint = SOCKET_POINT] endPoint
 * @returns promise of request
 */
export const sendMessageToProxy = async <T>(message: Omit<RequestMessage, 'notify'>, endPoint?: string) => {
    let data: T[] = []

    const socket = await getWebSocketInstance(SOCKET_POINT ?? endPoint)

    const sendPromise = () =>
        new Promise<T[]>((resolve, reject) => {
            socket.addEventListener('message', (event: MessageEvent<string>) => {
                const { results = [], error } = JSON.parse(event.data) as PayloadMessage<T>
                if (error) {
                    socket.close()
                    reject(error)
                }
                if (results.length === 0) {
                    socket.close()
                    resolve(data)
                }
                data = [...data, ...results]
            })
            socket.send(JSON.stringify(message))
        })

    return sendPromise()
}
