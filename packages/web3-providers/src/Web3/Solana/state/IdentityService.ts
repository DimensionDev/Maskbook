import { compact } from 'lodash-es'
import { NetworkPluginID, type SocialIdentity, type SocialAddress, SocialAddressType } from '@masknet/shared-base'
import { type ChainId, isValidAddress } from '@masknet/web3-shared-solana'
import { IdentityServiceState } from '../../Base/state/IdentityService.js'

const SOL_RE = /\S{1,256}\.sol\b/i

function getSolanaAddress(bio: string) {
    const addressMatched = bio.match(/\b\w{32,44}\b/)
    const address = addressMatched?.[0]
    if (address && !address.startsWith('0x') && isValidAddress(address)) return address
    return
}

function getSolanaDomain(nickname: string, bio: string) {
    const [matched] = nickname.match(SOL_RE) ?? bio.match(SOL_RE) ?? []
    return matched
}

export class SolanaIdentityService extends IdentityServiceState<ChainId> {
    protected override async getFromRemote(identity: SocialIdentity) {
        const { bio = '', nickname = '' } = identity
        const address = getSolanaAddress(bio)
        const domain = getSolanaDomain(nickname, bio)

        return compact<SocialAddress<ChainId>>([
            address ?
                {
                    pluginID: NetworkPluginID.PLUGIN_SOLANA,
                    type: SocialAddressType.Address,
                    label: '',
                    address,
                }
            :   undefined,
        ])
    }
}
