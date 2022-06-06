import type { Plugin } from '@masknet/plugin-infra'
import { SocialIdentity, SocialAddress, NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'

const SOL_RE = /\S{1,256}\.sol\b/
const ADDRESS_FULL = /(?!0x)(?=[A-Za-z])\w{44}/

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    protected override async getFromRemote(identity: SocialIdentity) {
        const addressMatched = identity.bio?.match(ADDRESS_FULL) ?? null
        const address = addressMatched?.[0]

        return [
            address
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_SOLANA,
                      type: SocialAddressType.ADDRESS,
                      label: address,
                      address,
                  }
                : null,
        ].filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_SOLANA>>
    }
}
