/// <reference types="web-ext-types" />
/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

declare module NodeJS {
    interface ProcessEnv {
        /** test means Jest. Puppeteer test does not use "test".  */
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly STORYBOOK?: boolean
        readonly target: 'chromium' | 'firefox' | 'safari' | 'E2E'
        readonly architecture: 'web' | 'app'
        /** fennec = stable firefox; geckoview = next generation firefox (used in Android App, in future it will become the default engine on Firefox for Android) */
        readonly firefoxVariant: 'fennec' | 'geckoview'
        /**
         * STRONGLY SUGGEST to make the app flexible as possible!
         * This value is the build time fallback for the screen size.
         * It DOESN't means the app MUST run in this size.
         */
        readonly resolution: 'desktop' | 'mobile'
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
