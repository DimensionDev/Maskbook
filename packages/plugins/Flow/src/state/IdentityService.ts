import type { Plugin } from '@masknet/plugin-infra'
import { IdentityServiceState } from '@masknet/web3-state'
import { SocialIdentity, SocialAddress, NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-flow'

function getFlowAddress(bio: string) {
    const addressMatched = bio.match(/\b0x\w{16}\b/) ?? null
    const address = addressMatched?.[0]
    if (address && isValidAddress(address)) return address
    return
}

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    protected override async getFromRemote({ bio = '' }: SocialIdentity) {
        const address = getFlowAddress(bio)

        return [
            address
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_FLOW,
                      type: SocialAddressType.ADDRESS,
                      label: address,
                      address,
                  }
                : null,
        ].filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_FLOW>>
    }
}
