const PROXY_URL = 'wss://api-v4.zerion.io'

export interface MessageBase {
    id: string
}

export interface RequestMessage extends MessageBase {
    method: string
    params: unknown
}

export interface PayloadMessage extends MessageBase {
    error?: unknown
    result?: unknown[]
}

interface PollItem<T extends unknown = unknown> {
    pickedAt?: Date
    createdAt: Date
    updatedAt?: Date
    data: T[]
}

// todo:
// 1. avoid duplicate instance
// 2. auto reconnection
// 3. handle data is end
export class ProviderProxy {
    private readonly _socket: WebSocket
    private readonly _poll: Map<string, PollItem>

    constructor(point: string, notifyFn: (id: string) => void) {
        this._socket = new WebSocket(point)
        this._poll = new Map<string, PollItem>()
        this._socket.addEventListener('message', (event: MessageEvent<string>) => {
            console.debug('Message from server ', event.data)
            const { id, result, error } = JSON.parse(event.data) as PayloadMessage
            if (error || !id) {
                // TODO: handle errors
            }
            if (result) {
                const updatedAt = new Date()
                const itemInPoll = this._poll.get(id) ?? { data: [], createdAt: updatedAt }
                const dataInPool = itemInPoll?.data ?? []
                const patchData = [...dataInPool, ...(result ?? [])]
                this._poll.set(id, { ...itemInPoll, updatedAt: updatedAt, data: patchData })
                notifyFn(id)
            }
        })
    }

    /**
     * Send request to proxy websocket
     * @param message
     */
    send(message: RequestMessage) {
        if (this._poll.has(message.id)) {
            //TODO: notify to pick
            return
        }
        this._socket.send(JSON.stringify(message))
        this._poll.set(message.id, { data: [], createdAt: new Date() })
    }

    get socket(): WebSocket {
        return this._socket
    }

    getResult<T>(id: string): T[] {
        return (this._poll.get(id)?.data ?? []) as T[]
    }
}
