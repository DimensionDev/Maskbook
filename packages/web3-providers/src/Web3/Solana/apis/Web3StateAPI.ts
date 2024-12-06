import { NetworkPluginID } from '@masknet/shared-base'
import { type Web3State } from '@masknet/web3-shared-solana'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { networkStorage } from '../../Base/storage.js'

export async function createSolanaState(context: WalletAPI.IOContext): Promise<Web3State> {
    const [network] = await Promise.all([networkStorage(NetworkPluginID.PLUGIN_SOLANA)])

    const state: Web3State = {
        Wallet: context.Solana,
        IdentityService: new IdentityService.SolanaIdentityService(),
        Network: new Network.SolanaNetwork(NetworkPluginID.PLUGIN_SOLANA, network.networkID, network.networks),
    }
    return state
}
