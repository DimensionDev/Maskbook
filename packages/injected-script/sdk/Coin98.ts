import type { RequestArguments } from 'web3-core'
import { InjectedProvider } from './Base'

export enum Coin98ProviderType {
    EVM = 1,
    Solana = 2,
    Near = 3,
}

export class Coin98Provider extends InjectedProvider {
    constructor(protected type: Coin98ProviderType) {
        const pathnameMap: Record<Coin98ProviderType, string> = {
            [Coin98ProviderType.EVM]: 'coin98.provider',
            [Coin98ProviderType.Near]: 'coin98.near',
            [Coin98ProviderType.Solana]: 'coin98.sol',
        }

        super(pathnameMap[type])
    }

    override async request(data: RequestArguments): Promise<unknown> {
        // coin98 cannot handle it correctly (test with coin98 v6.0.3)
        if (data.method === 'eth_chainId') {
            return this.getProperty('chainId')
        }
        return super.request(data)
    }
}
