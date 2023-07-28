import { InjectedProvider } from './Base.js'

export class CloverProvider extends InjectedProvider {
    constructor() {
        super('clover')
    }

    override async untilAvailable(): Promise<void> {
        try {
            await super.untilAvailable(() => {
                return super.getProperty<boolean>('isClover')
            })
        } catch (error) {
            console.log('DEBUG: clover error')
            console.log(error)
        }
    }
}
