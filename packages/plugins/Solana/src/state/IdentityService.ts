import type { Plugin } from '@masknet/plugin-infra'
import { SocialIdentity, SocialAddress, NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'
import { ChainId, formatAddress, isValidAddress } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../messages.js'

const SOL_RE = /\S{1,256}\.sol\b/

function getSolanaName(nickname: string, bio: string) {
    const [matched] = nickname.match(SOL_RE) ?? bio.match(SOL_RE) ?? []
    return matched
}

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    protected override async getFromRemote(identity: SocialIdentity) {
        const { identifier, bio = '', nickname = '' } = identity
        const addressMatched = bio.match(/\b\w{32,44}\b/)
        const address = addressMatched?.[0]
        const solanaName = getSolanaName(nickname, bio)
        const solanaDomainAddress = solanaName ? await SolanaRPC.lookup(ChainId.Mainnet, solanaName) : undefined

        return [
            address && !address.startsWith('0x') && isValidAddress(address)
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_SOLANA,
                      type: SocialAddressType.ADDRESS,
                      label: formatAddress(address, 4),
                      address,
                  }
                : null,
            solanaDomainAddress
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_SOLANA,
                      type: SocialAddressType.SOL,
                      label: solanaName,
                      address: solanaDomainAddress,
                  }
                : null,
        ].filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_SOLANA>>
    }
}
