import { InjectedProvider } from './Base.js'

export class SolflareProvider extends InjectedProvider {
    constructor() {
        super('solflare')
    }

    override async connect(options: unknown): Promise<unknown> {
        await super.connect(options)
        const publicKey = (await super.getProperty('publicKey')) as string
        return {
            publicKey,
        }
    }
}
