const GAS_NOW_WS = 'wss://www.gasnow.org/ws'
const RECONNECT_INTERVAL = 30 /* seconds */ * 1000 /* milliseconds */

enum ConnectionStatus {
    INITIAL,
    OPENED,
    CLOSED,
    ERROR,
}

class GasNowConnectionManager {
    public status = ConnectionStatus.INITIAL
    private ws: WebSocket | null = null

    public connect() {
        if (this.status === ConnectionStatus.OPENED) return

        // create a new webscoket connection
        const ws = new WebSocket(GAS_NOW_WS)
        ws.onopen = () => {
            this.status = ConnectionStatus.OPENED
        }
        ws.onmessage = (ev) => {
            if (this.status !== ConnectionStatus.OPENED) return

            const data = JSON.parse(ev.data as string) as {
                gasPrices: {
                    rapid: string
                    fast: string
                    standard: string
                    slow: string
                }
            }
            console.log(data)
        }
        ws.onclose = () => {
            this.status = ConnectionStatus.CLOSED
            this.reconnect()
        }
        ws.onerror = (err) => {
            ws.close()
            this.status = ConnectionStatus.ERROR
            this.reconnect()
        }
        this.ws = ws
    }

    public reconnect() {
        setTimeout(() => {
            this.connect()
        }, RECONNECT_INTERVAL)
    }

    public disconnect() {
        this.status = ConnectionStatus.CLOSED
        if (this.ws) this.ws.close()
    }
}

const manager = new GasNowConnectionManager()

export function connect() {
    manager.connect()
}

export function disconnect() {
    manager.disconnect()
}
