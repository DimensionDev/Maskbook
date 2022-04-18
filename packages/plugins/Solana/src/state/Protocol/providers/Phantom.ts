import type { Web3Plugin } from '@masknet/plugin-infra/src/entry-web3'
import type { ChainId } from '@masknet/web3-shared-solana'
import type { Provider } from '../types'
import { BaseProvider } from './Base'

export class PhantomProvider extends BaseProvider implements Provider {
    override connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    override disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
