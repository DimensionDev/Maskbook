declare module 'typeson' {
    export type CustomRegister<Type, InternalRepresentation> = [
        (x: unknown) => boolean,
        (x: Type) => InternalRepresentation,
        (x: InternalRepresentation) => Type,
    ]
    export class Undefined {}
    export default class Typeson {
        static Promise: typeof globalThis.Promise
        constructor(options?: {
            cyclic?: boolean
            encapsulateObserver?: (...args: unknown[]) => void
            sync?: true
            throwOnBadSyncType?: true
        })
        register(register: any): Typeson
        encapsulate(data: unknown, state?: any, opts?: any): object
        revive<T>(data: unknown, state?: any, opts?: any): T
        encapsulateAsync(data: unknown, state?: any, opts?: any): Promise<object>
        reviveAsync<T>(data: unknown, state?: any, opts?: any): Promise<T>
        stringify(...args: Parameters<JSON['stringify']>): Promise<string> | string
        stringifySync(...args: Parameters<JSON['stringify']>): string
        stringifyAsync(...args: Parameters<JSON['stringify']>): Promise<string>
        parse<T>(...args: Parameters<JSON['parse']>): Promise<T> | T
        parseSync<T>(...args: Parameters<JSON['parse']>): T
        parseAsync<T>(...args: Parameters<JSON['parse']>): Promise<T>
    }
}
