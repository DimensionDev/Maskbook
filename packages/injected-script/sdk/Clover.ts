import { InjectedProvider } from './Base.js'

export class CloverProvider extends InjectedProvider {
    constructor() {
        super('clover')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => !!(await super.getProperty<boolean>('isClover')))
    }
}
