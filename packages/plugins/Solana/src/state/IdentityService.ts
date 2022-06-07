import type { Plugin } from '@masknet/plugin-infra'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'
import { SocialIdentity, SocialAddress, NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    protected override async getFromRemote(identity: SocialIdentity) {
        const addressMatched = identity.bio?.match(/\w{44}/) ?? null
        const address = addressMatched?.[0]

        return [
            address && !address.startsWith('0x')
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
