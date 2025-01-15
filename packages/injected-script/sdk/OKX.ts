import { InjectedWalletBridge } from './BaseInjected.js'
import { createPromise, sendEvent } from './utils.js'

export class OKXProvider extends InjectedWalletBridge {
    constructor() {
        super('okxwallet')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => !!(await super.getProperty<boolean>('isOKExWallet')))
    }

    override connect(options: unknown): Promise<void> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'enable'].join('.'), id, options))
    }

    override emit(event: string, data: unknown[]) {
        for (const f of this.events.get(event) || []) {
            try {
                Reflect.apply(f, null, event === 'chainChanged' ? [`0x${Number(data[0]).toString(16)}`] : data)
            } catch {}
        }
    }
}

export class OKXSolanaProvider extends InjectedWalletBridge {
    constructor() {
        super('okxwallet.solana')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => !!(await super.getProperty<boolean>('isOKExWallet')))
    }

    override connect(): Promise<void> {
        return createPromise((id) =>
            sendEvent('web3BridgeExecute', [this.pathname, 'connect'].join('.'), id, {
                onlyIfTrusted: false,
            }),
        )
    }

    override emit(event: string, data: unknown[]) {
        for (const f of this.events.get(event) || []) {
            try {
                Reflect.apply(f, null, event === 'chainChanged' ? [`0x${Number(data[0]).toString(16)}`] : data)
            } catch {}
        }
    }
}
