import { injectedCoin98Provider } from '@masknet/injected-script'
import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class Coin98Provider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(injectedCoin98Provider)
    }
}
