import differenceInSeconds from 'date-fns/differenceInSeconds'
export interface MessageBase {
    id: string
}

export interface RequestMessage extends MessageBase {
    method: string
    params: unknown
}

export interface PayloadMessage extends MessageBase {
    error?: unknown
    results?: unknown[]
}

export interface PollItem<T extends unknown = unknown> {
    pickedAt?: Date
    createdAt: Date
    updatedAt?: Date
    data: T[]
    done?: boolean
}

// todo:
// 1. avoid duplicate instance
// 2. auto reconnection
// 3. handle data is end
// 4. handle open status
export class ProviderProxy {
    private readonly _socket: WebSocket
    private readonly _poll: Map<string, PollItem>
    private readonly _notify: (id: string) => void

    constructor(point: string, notifyFn: (id: string) => void) {
        this._socket = new WebSocket(point)
        this._poll = new Map<string, PollItem>()
        this._notify = notifyFn
    }

    public waitingOpen = () => {
        return new Promise<void>((resolve, reject) => {
            this._socket.addEventListener('open', () => resolve())
            this._socket.addEventListener('error', () => reject())
        })
    }

    public registerMessage = () => {
        this._socket.addEventListener('message', (event: MessageEvent<string>) => {
            console.debug('Message from server ', event.data)
            const { id, results, error } = JSON.parse(event.data) as PayloadMessage
            if (error || !id) {
                // TODO: handle errors
            }
            if (results) {
                const updatedAt = new Date()
                const itemInPoll = this._poll.get(id) ?? { data: [], createdAt: updatedAt }
                const dataInPool = itemInPoll?.data ?? []
                const patchData = [...dataInPool, ...(results ?? [])]
                this._poll.set(id, { ...itemInPoll, updatedAt, data: patchData })
                this._notify(id)
            }
        })
    }

    /**
     * Send request to proxy websocket
     * @param message
     */
    send(message: RequestMessage) {
        const cache = this._poll.get(message.id)
        if (cache && !this.isExpired(cache!)) return

        this._socket.send(JSON.stringify(message))
        this._poll.set(message.id, { data: [], createdAt: new Date() })
    }

    get socket(): WebSocket {
        return this._socket
    }

    getResult<T>(id: string): T[] {
        // todo: update pick time
        return (this._poll.get(id)?.data ?? []) as T[]
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
}

const DEV = 'wss://hyper-proxy-development.mask-reverse-proxy.workers.dev'

enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

function getProxyWebsocketInstanceWrapper(): (notify: (id: string) => void) => Promise<ProviderProxy> {
    let cached: ProviderProxy
    return async (notify: (id: string) => void) => {
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
