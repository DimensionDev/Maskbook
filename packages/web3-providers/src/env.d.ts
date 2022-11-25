declare module 'ethjs-ens' {
    import { provider as Provider } from 'web3-core'
    export default class Ens {
        constructor(options: { provider: Provider; network: number }): void

        lookup(name: string): Promise<string>
        reverse(address: string): Promise<string>
        resolveAddressForNode(node: string): Promise<string>
    }
}

declare module '@ensdomains/eth-ens-namehash' {
    export function hash(name: string): string
}
