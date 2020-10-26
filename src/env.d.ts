/// <reference types="web-ext-types" />
/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

declare module NodeJS {
    interface ProcessEnv {
        /** test means Jest. Puppeteer test does not use "test".  */
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly STORYBOOK?: boolean
        readonly target: 'chromium' | 'firefox' | 'safari' | 'E2E'
        readonly build: 'stable' | 'beta' | 'insider'
        readonly architecture: 'web' | 'app'
        /** fennec = stable firefox; geckoview = next generation firefox (used in Android App, in future it will become the default engine on Firefox for Android) */
        readonly firefoxVariant: 'fennec' | 'geckoview'
        /**
         * STRONGLY SUGGEST to make the app flexible as possible!
         * This value is the build time fallback for the screen size.
         * It DOESN't means the app MUST run in this size.
         */
        readonly resolution: 'desktop' | 'mobile'

        /**
         * Debug flags
         */
        BUILD_DATE: string
        VERSION: string
        TAG_NAME: string
        COMMIT_HASH: string
        COMMIT_DATE: string
        REMOTE_URL: string
        BRANCH_NAME: string
        DIRTY: boolean
        TAG_DIRTY: boolean
    }
}

interface Clipboard extends EventTarget {
    write(data: ClipboardItem[]): Promise<void>
}

declare class ClipboardItem {
    constructor(data: { [mimeType: string]: Blob })
}

type PermissionNameWithClipboard = PermissionName | 'clipboard-read' | 'clipboard-write'

interface PermissionWithClipboardDescriptor {
    name: PermissionNameWithClipboard
}

interface Permissions {
    request(permission: { name: string }): Promise<PermissionStatus>
    query(permissionDesc: PermissionWithClipboardDescriptor): Promise<PermissionStatus>
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
        erc20?: boolean
        erc721?: boolean
        logo: string
        name: string
        symbol: string
    }
    const metadata: {
        [address: string]: TokenMetadata
    }
    export default metadata
}

declare module 'react-middle-ellipsis' {
    import React from 'react'
    interface ComponentProps {
        children?: React.ReactNode
    }
    const component: (props: ComponentProps) => JSX.Element
    export default component
}

declare module 'ethereum-blockies' {
    export interface BlockieOptions {
        seed?: string // seed used to generate icon data, default: random
        color?: string // to manually specify the icon color, default: random
        bgcolor?: string // choose a different background color, default: white
        size?: number // width/height of the icon in blocks, default: 10
        scale?: number // width/height of each block in pixels, default: 5
    }

    export function create(options?: BlockieOptions): HTMLCanvasElement
}

declare module '@transak/transak-sdk' {
    enum EVENTS {
        ALL_EVENTS = '*',
        TRANSAK_WIDGET_INITIALISED = 'TRANSAK_WIDGET_INITIALISED',
        TRANSAK_WIDGET_OPEN = 'TRANSAK_WIDGET_OPEN',
        TRANSAK_WIDGET_CLOSE_REQUEST = 'TRANSAK_WIDGET_CLOSE_REQUEST',
        TRANSAK_WIDGET_CLOSE = 'TRANSAK_WIDGET_CLOSE',
        TRANSAK_ORDER_CREATED = 'TRANSAK_ORDER_CREATED',
        TRANSAK_ORDER_CANCELLED = 'TRANSAK_ORDER_CANCELLED',
        TRANSAK_ORDER_FAILED = 'TRANSAK_ORDER_FAILED',
        TRANSAK_ORDER_SUCCESSFUL = 'TRANSAK_ORDER_SUCCESSFUL',
        TRANSAK_ERROR = 'TRANSAK_ERROR',
    }

    class TransakSDK {
        constructor(config: TransakSDKConfig) {}

        public on(name: string, callback: Function): void
        public init(): void
        public close(): void
        public closeRequest(): void
        public modal(): void

        public ALL_EVENTS_EVENTS = EVENTS.ALL
        public ERROR = EVENTS.TRANSAK_ERROR
        public EVENTS = EVENTS
    }

    export interface TransakSDKConfig {
        apiKey: string
        environment: 'STAGING' | 'PRODUCTION'
        defaultCryptoCurrency?: string
        walletAddress?: string
        themeColor?: string
        fiatCurrency?: string
        email?: string
        redirectURL: string
        hostURL: string
        widgetHeight?: string
        widgetWidth?: string
    }

    export default TransakSDK
}
