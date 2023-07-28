import { InjectedProvider } from './Base.js'

export class CloverProvider extends InjectedProvider {
    constructor() {
        super('clover')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isClover = await super.getProperty<boolean>('isClover')
            return !!isClover
        })
    }
}
