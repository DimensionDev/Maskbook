import { InjectedProvider } from './Base.js'

export class BrowserProvider extends InjectedProvider {
    constructor() {
        super('ethereum')
    }
}
