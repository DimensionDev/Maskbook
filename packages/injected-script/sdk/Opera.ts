import { BaseInjectedProvider } from './BaseInjected.js'

export class OperaProvider extends BaseInjectedProvider {
    constructor() {
        super('ethereum')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isOpera = await super.getProperty<boolean>('isOpera')
            return !!isOpera
        })
    }
}
