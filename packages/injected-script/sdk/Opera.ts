import { BaseProvider } from './Base.js'

export class OperaProvider extends BaseProvider {
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
