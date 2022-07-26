import Web3 from 'web3'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, SocialIdentity, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { createPayload, createWeb3Provider, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'
import type { RequestArguments } from 'web3-core'
import { KeyValue, RSS3 } from '@masknet/web3-providers'
import { getSiteType } from '@masknet/shared-base'

const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
const ADDRESS_FULL = /0x\w{40,}/
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

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedUIContext) {
        super()
    }

    override async getFromRemote(identity: SocialIdentity) {
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
            RSS3.getNameInfo(RSS3Id).then((x) => x?.address ?? ''),
            KeyValue.createJSON_Storage<Record<NetworkPluginID, { address: string; networkPluginID: NetworkPluginID }>>(
                `com.maskbook.user_${getSiteType()}`,
            )
                .get(identifier?.userId ?? '$unknown')
                .then((x) => x?.[NetworkPluginID.PLUGIN_EVM].address ?? ''),
        ])

        const getSettledAddress = (result: PromiseSettledResult<string>) => {
            return result.status === 'fulfilled' ? result.value : ''
        }

        const addressENS = getSettledAddress(allSettled[0])
        const addressRSS3 = getSettledAddress(allSettled[1])
        const addressKV = getSettledAddress(allSettled[2])

        return [
            isValidSocialAddress(address)
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_EVM,
                      type: SocialAddressType.ADDRESS,
                      label: address,
                      address,
                  }
                : null,
            isValidSocialAddress(addressENS)
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_EVM,
                      type: SocialAddressType.ENS,
                      label: ethereumName,
                      address: addressENS,
                  }
                : null,
            isValidSocialAddress(addressRSS3)
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_EVM,
                      type: SocialAddressType.RSS3,
                      label: `${RSS3Id}.rss3`,
                      address: addressRSS3,
                  }
                : null,
            isValidSocialAddress(addressKV)
                ? {
                      networkSupporterPluginID: NetworkPluginID.PLUGIN_EVM,
                      type: SocialAddressType.KV,
                      label: addressKV,
                      address: addressKV,
                  }
                : null,
        ].filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_EVM>>
    }
}
