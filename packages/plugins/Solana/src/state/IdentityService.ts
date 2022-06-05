import type { Plugin } from '@masknet/plugin-infra'
import { SocialIdentity, IdentityAddress, IdentityAddressType } from '@masknet/web3-shared-base'
import { ChainId, isValidAddress } from '@masknet/web3-shared-solana'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'

const SOL_RE = /(?=\w)\S{1,256}\.sol\b/
const ADDRESS_FULL = /(?!0x)\w{44}/

function isValidSocialAddress(address: string) {
    return address && isValidAddress(address)
}

function getSolanaName(twitterId: string, nickname: string, bio: string) {
    const [matched] = nickname.match(SOL_RE) ?? bio.match(SOL_RE) ?? []
    if (matched) return matched
    return twitterId && !twitterId.endsWith('.sol') ? `${twitterId}.sol` : twitterId
}

function getAddress(text: string) {
    const [matched] = text.match(ADDRESS_FULL) ?? []
    if (matched && isValidAddress(matched)) return matched
    return ''
}

export class IdentityService extends IdentityServiceState<ChainId> {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    override async lookup(identity: SocialIdentity): Promise<IdentityAddress[]> {
        const { identifier, bio = '', nickname = '' } = identity

        const address = getAddress(bio)
        const solanaName = getSolanaName(identifier?.userId ?? '', nickname, bio)

        // TODO Solana Domain to Address
        const addressSOL = address
        return [
            isValidSocialAddress(address)
                ? {
                      type: IdentityAddressType.ADDRESS,
                      chainId: ChainId.Mainnet,
                      label: address,
                      address,
                  }
                : null,
            isValidSocialAddress(addressSOL)
                ? {
                      type: IdentityAddressType.SOL,
                      chainId: ChainId.Mainnet,
                      label: solanaName,
                      address: addressSOL,
                  }
                : null,
        ].filter(Boolean) as IdentityAddress[]
    }
}
