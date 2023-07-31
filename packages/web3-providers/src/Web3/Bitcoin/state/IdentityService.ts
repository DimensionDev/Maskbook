import { compact } from 'lodash-es'
import type { Plugin } from '@masknet/plugin-infra'
import { type ChainId, isValidBitcoinAddress } from '@masknet/web3-shared-bitcoin'
import { NetworkPluginID, type SocialIdentity, type SocialAddress, SocialAddressType } from '@masknet/shared-base'
import { IdentityServiceState } from '../../Base/state/Identity.js'

function getBitcoinAddress(bio: string) {
    const addressMatched = bio.match(/\b^1[1-9A-HJ-NP-Za-km-z]{25,34}$\b/) ?? null
    const address = addressMatched?.[0]
    if (address && isValidBitcoinAddress(address)) return address
    return
}

export class IdentityService extends IdentityServiceState<ChainId> {
    constructor(protected context: Plugin.Shared.SharedUIContext) {
        super()
    }

    protected override async getFromRemote({ bio = '' }: SocialIdentity) {
        const address = getBitcoinAddress(bio)

        return compact<SocialAddress<ChainId>>([
            address
                ? {
                      pluginID: NetworkPluginID.PLUGIN_BITCOIN,
                      type: SocialAddressType.Address,
                      label: address,
                      address,
                  }
                : null,
        ])
    }
}
