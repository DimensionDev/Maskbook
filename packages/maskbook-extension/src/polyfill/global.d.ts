declare namespace Intl {
    export interface ListFormatOptions {
        localeMatcher: 'lookup' | 'best fit'
        type: 'conjunction' | 'disjunction' | 'unit'
        style: 'long' | 'short' | 'narrow'
    }
    export class ListFormat {
        constructor(options?: Partial<ListFormatOptions>)
        constructor(locales?: string, options?: Partial<ListFormatOptions>)
        format(str: string[]): string
    }
}

declare module '@ungap/promise-all-settled' {
    const AllSettledPolyfill: typeof Promise.allSettled
    export default AllSettledPolyfill
}

declare module 'string.prototype.matchall' {
    const shimAPI: {
        shim(): void
    }
    export default shimAPI
}
