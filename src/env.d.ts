/// <reference types="web-ext-types" />
/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

declare module NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test'
        STORYBOOK?: boolean
        target: 'chromium' | 'firefox' | 'safari' | 'E2E'
        architecture: 'web' | 'app'
        firefoxVariant: 'fennec' | 'geckoview'
        resolution: 'desktop' | 'mobile'
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
