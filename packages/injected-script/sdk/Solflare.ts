import { BaseInjectedProvider } from './BaseInjected.js'

export class SolflareProvider extends BaseInjectedProvider {
    constructor() {
        super('solflare')
    }

    override async connect(options: unknown): Promise<unknown> {
        await super.connect(options)
        return {
            publicKey: await super.getProperty<string>('publicKey'),
        }
    }
}
