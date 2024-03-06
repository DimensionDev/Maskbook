import { InjectedWalletBridge } from './BaseInjected.js'
import { createPromise, sendEvent } from './utils.js'

export class RainbowProvider extends InjectedWalletBridge {
    constructor() {
        super('rainbow')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => !!(await super.getProperty<boolean>('isRainbow')))
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
