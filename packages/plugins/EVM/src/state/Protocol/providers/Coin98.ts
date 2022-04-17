import type { Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class Coin98Provider extends BaseInjectedProvider implements Provider {
    constructor() {
        super(['coin98', 'provider'])
    }
}
