import type { Web3Plugin } from '@masknet/plugin-infra/src/entry-web3'
import type { ChainId } from '@masknet/web3-shared-solana'

export interface Provider {
    connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>>
    disconnect(): Promise<void>
}
