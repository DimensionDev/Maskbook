import { InjectedProvider } from './Base.js'

export class OperaProvider extends InjectedProvider {
    constructor() {
        super('ethereum')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(() => super.getProperty<boolean>('isOpera'))
    }
}
