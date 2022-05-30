import Web3 from 'web3'
import type { Plugin } from '@masknet/plugin-infra'
import { SocialIdentity, IdentityAddress, IdentityAddressType } from '@masknet/web3-shared-base'
import { ChainId, createPayload, createWeb3Provider, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'
import type { RequestArguments } from 'web3-core'

const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
const ADDRESS_FULL = /0x\w+/
// xxx.cheers.bio xxx.rss3.bio
const RSS3_URL_RE = /https?:\/\/(?<name>[\w.]+)\.(rss3|cheers)\.bio/
const RSS3_RNS_RE = /(?<name>[\w.]+)\.rss3/

function isValidSocialAddress(address: string) {
    return address && isValidAddress(address) && !isZeroAddress(address)
}

function getEthereumName(twitterId: string, nickname: string, bio: string) {
    const [matched] = nickname.match(ENS_RE) ?? bio.match(ENS_RE) ?? []
    if (matched) return matched
    return twitterId && !twitterId.endsWith('.eth') ? `${twitterId}.eth` : twitterId
}

function getRSS3Id(nickname: string, profileURL: string, bio: string) {
    const matched =
        nickname.match(RSS3_RNS_RE) || profileURL.match(RSS3_URL_RE) || bio.match(RSS3_URL_RE) || bio.match(RSS3_RNS_RE)
    return matched?.groups?.name ?? ''
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
        const { identifier, bio = '', nickname = '', homepage = '' } = identity

        const address = getAddress(bio)
        const ethereumName = getEthereumName(identifier?.userId ?? '', nickname, bio)
        const RSS3Id = getRSS3Id(nickname, homepage, bio)

        const web3 = new Web3(
            createWeb3Provider(async (requestArguments: RequestArguments) => {
                return (await this.context.send(createPayload(0, requestArguments.method, requestArguments.params)))
                    .result
            }),
        )
        const allSettled = await Promise.allSettled([
            web3.eth.ens.getAddress(ethereumName),
            '',
            '',
            // TODO: move to external apis
            // PluginProfileRPC.getRSS3AddressById(RSS3Id),
            // PluginNFTAvatarRPC.getAddress(identifier.userId ?? '', identifier.network),
        ])

        const getSettledAddress = (result: PromiseSettledResult<string>) => {
            return result.status === 'fulfilled' ? result.value : ''
        }

        const addressENS = getSettledAddress(allSettled[0])
        const addressRSS3 = getSettledAddress(allSettled[1])
        const addressGUN = getSettledAddress(allSettled[2])

        return [
            isValidSocialAddress(address)
                ? {
                      type: IdentityAddressType.ADDRESS,
                      chainId: ChainId.Mainnet,
                      label: address,
                      address,
                  }
                : null,
            isValidSocialAddress(addressENS)
                ? {
                      type: IdentityAddressType.ENS,
                      chainId: ChainId.Mainnet,
                      label: ethereumName,
                      address: addressENS,
                  }
                : null,
            isValidSocialAddress(addressRSS3)
                ? {
                      type: IdentityAddressType.RSS3,
                      chainId: ChainId.Mainnet,
                      label: `${RSS3Id}.rss3`,
                      address: addressRSS3,
                  }
                : null,
            isValidSocialAddress(addressGUN)
                ? {
                      type: IdentityAddressType.GUN,
                      chainId: ChainId.Mainnet,
                      label: addressGUN,
                      address: addressGUN,
                  }
                : null,
        ].filter(Boolean) as IdentityAddress[]
    }
}
