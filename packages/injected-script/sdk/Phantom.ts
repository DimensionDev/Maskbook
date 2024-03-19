import { InjectedWalletBridge } from './BaseInjected.js'

export class PhantomProvider extends InjectedWalletBridge {
    constructor() {
        super('phantom.solana')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const result = await super.getProperty<boolean>('isPhantom')
            // OKX wallet also has `phantom.solana.isPhantom` but not `phantom.ethereum`
            // To distinguish between them, check phantom.ethereum.isPhantom as well.
            const hasEthereum = await super.getProperty<boolean>('isPhantom', 'phantom.ethereum')
            return !!result && !!hasEthereum
        })
    }

    override async connect(options: unknown): Promise<unknown> {
        await super.connect(options)
        return {
            publicKey: await super.getProperty<string>('publicKey'),
        }
    }
}
