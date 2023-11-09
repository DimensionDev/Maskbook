import { InjectedWalletBridge } from './BaseInjected.js'

export class SolflareProvider extends InjectedWalletBridge {
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
