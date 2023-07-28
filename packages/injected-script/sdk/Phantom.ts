import { InjectedProvider } from './Base.js'

export class PhantomProvider extends InjectedProvider {
    constructor() {
        super('phantom.solana')
    }

    override async connect(options: unknown): Promise<unknown> {
        await super.connect(options)
        return {
            publicKey: await super.getProperty<string>('publicKey'),
        }
    }
}
