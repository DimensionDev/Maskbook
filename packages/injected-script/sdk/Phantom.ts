import { BaseProvider } from './Base.js'

export class PhantomProvider extends BaseProvider {
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
