import type { AsyncCallOptions } from 'async-call-rpc'
type MessageChannel = AsyncCallOptions['messageChannel']
export class WorkerMessage implements MessageChannel {
    private isMainRealm = typeof document === 'object'
    private ref: { type: 'worker'; main: Worker } | { type: 'main'; worker: Worker[] }
    private listeners: Set<(...args: any) => void> = new Set()
    constructor() {
        if (this.isMainRealm) {
            this.ref = { type: 'main', worker: [] }
            const worker = new Worker('/js/crypto-worker.js')
            worker.addEventListener(
                'message',
                () => {
                    if (this.ref.type !== 'main') return
                    this.ref.worker.push(worker)
                    worker.addEventListener('message', (e) => this.listeners.forEach((x) => x(e.data)))
                },
                {
                    once: true,
                },
            )
        } else {
            this.ref = {
                type: 'worker',
                // TypeScript problem
                main: globalThis as any,
            }
            this.ref.main.postMessage('online')
        }
    }
    emit(event: string, data: object): void {
        // TODO: maybe ArrayBuffers can transfer instead of clone?
        if (this.ref.type === 'main') {
            const worker1 = this.ref.worker[0]
            if (!worker1) return void setTimeout(() => this.emit(event, data), 200)
            worker1.postMessage(data)
        } else {
            this.ref.main.postMessage(data)
        }
    }
    on(event: string, callback: (data: unknown) => void) {
        if (this.ref.type === 'main') {
            this.listeners.add(callback)
        } else {
            this.ref.main.addEventListener('message', (e) => callback(e.data))
        }
    }
}
