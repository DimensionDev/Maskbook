/// <reference types="@masknet/global-types/webpack" />

declare module '@siddomains/sidjs' {
    import { Provider } from 'react'

    export function getSidAddress(chain: number): number
    export default class SID {
        constructor(options: { provider: Provider; sidAddress: number }): void

        name(name: string): Name
        getName(address: string): Promise<{ name?: string }>
    }

    export class Name {
        getAddress(): string
    }
}
