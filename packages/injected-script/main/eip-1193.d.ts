// https://eips.ethereum.org/EIPS/eip-1193
declare var ethereum: Ethereum | undefined
interface Ethereum {
    isConnected(): boolean
    request(data: unknown): Promise<unknown>
    on(event: string, listener: (...args: any) => void): void
    isMetaMask?: boolean
    _metamask?: {
        isUnlocked?(): Promise<boolean>
    }
}
