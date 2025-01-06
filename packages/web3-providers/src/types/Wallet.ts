import type { Subscription } from '@masknet/shared-base'
import type { ChainId as EVMChainId, RequestArguments } from '@masknet/web3-shared-evm'
import type { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'

export namespace WalletAPI {
    export interface IOContext {
        EVM: {
            chainId: Subscription<EVMChainId>
            account: Subscription<string>
            request?: <T>(parameters: RequestArguments) => Promise<T>
        }
        Solana: {
            chainId: Subscription<SolanaChainId>
            account: Subscription<string>
        }
    }
}
