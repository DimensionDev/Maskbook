import { InjectedProvider } from './Base.js'

export class OperaProvider extends InjectedProvider {
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
