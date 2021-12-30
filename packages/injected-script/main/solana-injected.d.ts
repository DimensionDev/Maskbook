declare var solana: Solana | undefined
interface Solana {
    isConnected: boolean
    connect(): Promise<unknown>
    request(data: unknown): Promise<unknown>
    postMessage(data: unknown): Promise<unknown>
    on(event: string, listener: (...args: any) => void): void
    off(event: string, listener: (...args: any) => void): void
    isPhantom?: boolean
    publicKey?: {
        toString(): string
    }
}
