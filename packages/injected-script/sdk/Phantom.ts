import { InjectedProvider } from './Base'

export class PhantomProvider extends InjectedProvider {
    constructor() {
        super('phantom.solana')
    }
    override async connect(options: unknown): Promise<unknown> {
        await super.connect(options)
        const publicKey = (await super.getProperty('publicKey')) as string
        return {
            publicKey,
        }
    }
}
