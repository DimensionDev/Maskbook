import type { Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../../../messages'

export class WalletState implements Web3Plugin.ObjectCapabilities.WalletState {
    async addWallet(chainId: ChainId, id: string, wallet: Web3Plugin.Wallet) {
        const wallets = await EVM_RPC.getStorageValue('persistent', 'wallets')
    }
}
