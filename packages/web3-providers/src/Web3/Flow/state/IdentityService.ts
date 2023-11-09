import { compact } from 'lodash-es'
import type { WalletAPI } from '../../../entry-types.js'
import { type ChainId, isValidAddress } from '@masknet/web3-shared-flow'
import { NetworkPluginID, type SocialIdentity, type SocialAddress, SocialAddressType } from '@masknet/shared-base'
import { IdentityServiceState } from '../../Base/state/Identity.js'

function getFlowAddress(bio: string) {
    const addressMatched = bio.match(/\b0x\w{16}\b/) ?? null
    const address = addressMatched?.[0]
    if (address && isValidAddress(address)) return address
    return
}

export class FlowIdentityService extends IdentityServiceState<ChainId> {
    constructor(protected context: WalletAPI.IOContext) {
        super()
    }

    protected override async getFromRemote({ bio = '' }: SocialIdentity) {
        const address = getFlowAddress(bio)

        return compact<SocialAddress<ChainId>>([
            address
                ? {
                      pluginID: NetworkPluginID.PLUGIN_FLOW,
                      type: SocialAddressType.Address,
                      label: address,
                      address,
                  }
                : null,
        ])
    }
}
