/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />
/// <reference types="@masknet/global-types/webpack" />
/// <reference types="@masknet/global-types/flag" />
/// <reference types="@masknet/global-types/dom" />

declare module 'ethjs-ens' {
    import { provider as Provider } from 'web3-core'
    import { ChainId } from '../../web3-shared/evm'

    export default class Ens {
        constructor(options: { provider: Provider; network: ChainId }) {}
        lookup(name: string): Promise<string>
        reverse(address: string): Promise<string>
    }
}
