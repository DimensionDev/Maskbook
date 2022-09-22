declare module 'typeson' {
    export type CustomRegister<Type = unknown, InternalRepresentation = unknown> = readonly [
        (x: unknown) => boolean,
        (x: Type) => InternalRepresentation,
        (x: InternalRepresentation) => Type,
    ]
    export class Undefined {}
    export class TypesonPromise<T> {
        constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void)
    }
    export type CustomRegisters = Record<string, CustomRegister<any, any> | NewableFunction>

    export class Typeson {
        constructor(options?: {
            cyclic?: boolean
            encapsulateObserver?: (...args: unknown[]) => void
            sync?: boolean
            throwOnBadSyncType?: boolean
        })
        register(register: unknown[] | CustomRegisters): Typeson
        encapsulate(data: unknown): any
        revive<T>(data: unknown): T
        stringify(...args: Parameters<JSON['stringify']>): Promise<string> | string
        stringifySync(...args: Parameters<JSON['stringify']>): string
        stringifyAsync(...args: Parameters<JSON['stringify']>): Promise<string>
        parse<T>(...args: Parameters<JSON['parse']>): Promise<T> | T
        parseSync<T>(...args: Parameters<JSON['parse']>): T
        parseAsync<T>(...args: Parameters<JSON['parse']>): Promise<T>
    }
}

declare module 'typeson-registry' {
    import { CustomRegister } from 'typeson'
    export const blob: any,
        builtin: any,
        cryptokey: any,
        file: any,
        filelist: any,
        imagebitmap: any,
        specialNumbers: any
}
