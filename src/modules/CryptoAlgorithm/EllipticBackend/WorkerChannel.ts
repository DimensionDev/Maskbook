import type { EventBasedChannel } from 'async-call-rpc/full'
import { OnlyRunInContext } from '@holoflows/kit'

export class WorkerMessage implements EventBasedChannel {
    private isMainRealm = typeof document === 'object'
    private ref: { type: 'worker'; main: Worker } | { type: 'main'; worker: Worker[] }
    private listeners: Set<(...args: any) => void> = new Set()
    constructor() {
        skipSSR: if (this.isMainRealm) {
            this.ref = { type: 'main', worker: [] }
            if (typeof window !== 'object') break skipSSR
            OnlyRunInContext('background', '')
            const worker = new Worker('/workers/crypto_worker.js')
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
    send(data: object): void {
        // TODO: maybe ArrayBuffers can transfer instead of clone?
        if (this.ref.type === 'main') {
            const worker1 = this.ref.worker[0]
            if (!worker1) return void setTimeout(() => this.send(data), 200)
            worker1.postMessage(data)
        } else {
            this.ref.main.postMessage(data)
        }
    }
    on(callback: (data: unknown) => void) {
        if (this.ref.type === 'main') {
            this.listeners.add(callback)
            return () => this.listeners.delete(callback)
        } else {
            const x = this.ref.main
            const cb = (e: MessageEvent): void => callback(e.data)
            x.addEventListener('message', cb)
            return () => x.removeEventListener('message', cb)
        }
    }
}
