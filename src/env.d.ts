/// <reference types="web-ext-types" />
/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

declare const webpackEnv: {
    readonly target: 'Chromium' | 'Firefox' | 'WKWebview' | 'E2E' | undefined
    readonly firefoxVariant: 'android' | 'desktop' | 'GeckoView' | undefined
    readonly genericTarget: 'facebookApp' | 'browser'
    readonly shadowRootMode: 'open' | 'closed'
}

declare module NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test'
        STORYBOOK?: boolean
    }
}

interface Permissions {
    request(permission: { name: string }): Promise<PermissionStatus>
}

declare module 'typeson' {
    export type CustomRegister<Type, InternalRepresentation> = [
        (x: unknown) => boolean,
        (x: Type) => InternalRepresentation,
        (x: InternalRepresentation) => Type,
    ]
    export class Undefined {}
    export default class Typeson {
        constructor(options?: {
            cyclic?: boolean
            encapsulateObserver?: (...args: unknown[]) => void
            sync?: true
            throwOnBadSyncType?: true
        })
        register(register: unknown[] | Record<string, CustomRegister<any, any> | NewableFunction>): Typeson
        encapsulate(data: unknown): object
        revive<T>(data: unknown): T
        stringify(...args: Parameters<JSON['stringify']>): Promise<string> | string
        stringifySync(...args: Parameters<JSON['stringify']>): string
        stringifyAsync(...args: Parameters<JSON['stringify']>): Promise<string>
        parse<T>(...args: Parameters<JSON['parse']>): Promise<T> | T
        parseSync<T>(...args: Parameters<JSON['parse']>): T
        parseAsync<T>(...args: Parameters<JSON['parse']>): Promise<T>
    }
}

declare module 'eth-contract-metadata' {
    export interface TokenMetadata {
        decimals: number
        erc20: boolean
        logo: string
        name: string
        symbol: string
        address: string
    }
    const metadata: {
        [address: string]: TokenMetadata
    }
    export default metadata
}

declare module 'eth-token-tracker' {
    import type { WebsocketProvider } from 'web3-core'

    // https://github.com/MetaMask/eth-token-tracker/blob/master/lib/token.js
    export interface TrackerMetadata {
        address: string
        balance: string
        symbol: string
        decimals: string
    }

    export interface TrackerOptions {
        userAddress: string
        provider: WebsocketProvider
        pollingInterval?: number
        tokens: (Partial<TrackerMetadata> & { address: string })[]
    }

    export default class Tracker {
        constructor(options: TrackerOptions)
        public serialize(): TrackerMetadata[]
        public updateBalances(): Promise<void>
        public add(metadata: Partial<TrackerMetadata> & { address: string }): void
        public stop(): void
        public on(name: 'error', callback: (error: Error) => void): void
        public on(name: 'update', callback: (balances: TrackerMetadata[]) => void): void
        public removeListener(name: 'error', callback: (error: Error) => void): void
        public removeListener(name: 'update', callback: (balances: TrackerMetadata[]) => void): void
    }
}
