/// <reference types="@masknet/global-types/webpack" />

declare module 'ethjs-ens' {
    import { provider as Provider } from 'web3-core'
    export default class Ens {
        constructor(options: { provider: Provider; network: number }) {}
        lookup(name: string): Promise<string>
        reverse(address: string): Promise<string>
        resolveAddressForNode(node: string): Promise<string>
    }
}

declare module '@ensdomains/eth-ens-namehash' {
    export function hash(name: string): string
}

declare module '@siddomains/sidjs' {
    import { Provider } from 'react'

    export function getSidAddress(chain: number): number
    export default class SID {
        constructor(options: { provider: Provider; sidAddress: number }): void

        name(name: string): Name
        getName(address: string): Promise<string>
    }

    export class Name {
        getAddress(): string
    }
}
