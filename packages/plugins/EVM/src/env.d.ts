declare module 'ethjs-ens' {
    import { provider as Provider } from 'web3-core'
    export default class Ens {
        constructor(options: { provider: Provider; network: number }) {}
        lookup(name: string): Promise<string>
        reverse(address: string): Promise<string>
    }
}
