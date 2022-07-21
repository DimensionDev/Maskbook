import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, SocialIdentity, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { createPayload, createWeb3Provider, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'
import { KeyValue, NextIDProof, RSS3 } from '@masknet/web3-providers'
import { EMPTY_LIST, EnhanceableSite, getSiteType, NextIDPlatform } from '@masknet/shared-base'

const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
const ADDRESS_FULL = /0x\w{40,}/
// xxx.cheers.bio xxx.rss3.bio
const RSS3_URL_RE = /https?:\/\/(?<name>[\w.]+)\.(rss3|cheers)\.bio/
const RSS3_RNS_RE = /(?<name>[\w.]+)\.rss3/

function getEthereumName(twitterId: string, nickname: string, bio: string) {
    const [matched] = nickname.match(ENS_RE) ?? bio.match(ENS_RE) ?? EMPTY_LIST
    if (matched) return matched
    return twitterId && !twitterId.endsWith('.eth') ? `${twitterId}.eth` : twitterId
}

function getRSS3Id(nickname: string, profileURL: string, bio: string) {
    const matched =
        nickname.match(RSS3_RNS_RE) || profileURL.match(RSS3_URL_RE) || bio.match(RSS3_URL_RE) || bio.match(RSS3_RNS_RE)
    return matched?.groups?.name ?? ''
}

function getAddress(text: string) {
    const [matched] = text.match(ADDRESS_FULL) ?? EMPTY_LIST
    if (matched && isValidAddress(matched)) return matched
    return ''
}

function getNextIDPlatform() {
    const site = getSiteType()
    if (site === EnhanceableSite.Twitter) return NextIDPlatform.Twitter
    return NextIDPlatform.Twitter
}

async function getWalletAddressesFromNextID(userId: string) {
    if (!userId) return EMPTY_LIST
    const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(getNextIDPlatform(), userId)

    for (const binding of bindings) {
        const identities = binding.proofs
            .filter((x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity))
            .map((y) => y.identity)
        if (identities.length) return identities
    }
    return EMPTY_LIST
}

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    /** When it has an allowlist, it then detects if a social address type is included.*/
    private isSocialAddressIncludes(type: SocialAddressType, includes: SocialAddressType[] = []) {
        return includes.length === 0 || includes.includes(type)
    }

    private createSocialAddress(
        type: SocialAddressType,
        address: string,
        label = address,
    ): SocialAddress<NetworkPluginID.PLUGIN_EVM> | undefined {
        if (address && isValidAddress(address) && !isZeroAddress(address))
            return {
                networkSupporterPluginID: NetworkPluginID.PLUGIN_EVM,
                type,
                label,
                address,
            }
        return
    }

    /** Read a social address from bio. */
    private async getSocialAddressFromBio({ bio = '' }: SocialIdentity) {
        return this.createSocialAddress(SocialAddressType.ADDRESS, getAddress(bio ?? ''))
    }

    /** Read a social address from NextID. */
    private async getSocialAddressFromNextID({ identifier }: SocialIdentity) {
        const listOfAddress = await getWalletAddressesFromNextID(identifier?.userId ?? '')
        return listOfAddress
            .map((x) => this.createSocialAddress(SocialAddressType.NEXT_ID, x))
            .filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_EVM>>
    }

    /** Read a social address from bio when it contains a RSS3 ID. */
    private async getSocialAddressFromRSS3({ nickname = '', homepage = '', bio = '' }: SocialIdentity) {
        const RSS3Id = getRSS3Id(nickname, homepage, bio)
        const info = await RSS3.getNameInfo(RSS3Id)
        return this.createSocialAddress(SocialAddressType.RSS3, info?.address ?? '', `${RSS3Id}.rss3`)
    }

    /** Read a social address from KV service. */
    private async getSocialAddressFromKV({ identifier }: SocialIdentity) {
        const address = await KeyValue.createJSON_Storage<
            Record<NetworkPluginID, { address: string; networkPluginID: NetworkPluginID }>
        >(`com.maskbook.user_${getSiteType()}`)
            .get(identifier?.userId ?? '$unknown')
            .then((x) => x?.[NetworkPluginID.PLUGIN_EVM].address ?? '')

        return this.createSocialAddress(SocialAddressType.KV, address)
    }

    /** Read a social address from nickname, bio if them contain a ENS. */
    private async getSocialAddressFromENS({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const ethereumName = getEthereumName(identifier?.userId ?? '', nickname, bio)
        if (!ethereumName) return

        const web3 = new Web3(
            createWeb3Provider(async (requestArguments: RequestArguments) => {
                return (await this.context.send(createPayload(0, requestArguments.method, requestArguments.params)))
                    .result
            }),
        )
        return this.createSocialAddress(
            SocialAddressType.ENS,
            await web3.eth.ens.getAddress(ethereumName),
            ethereumName,
        )
    }

    override async getFromRemote(identity: SocialIdentity, includes?: SocialAddressType[]) {
        const allSettled = await Promise.allSettled([
            this.isSocialAddressIncludes(SocialAddressType.ADDRESS, includes)
                ? this.getSocialAddressFromBio(identity)
                : undefined,
            this.isSocialAddressIncludes(SocialAddressType.ENS, includes)
                ? this.getSocialAddressFromENS(identity)
                : undefined,
            this.isSocialAddressIncludes(SocialAddressType.RSS3, includes)
                ? this.getSocialAddressFromRSS3(identity)
                : undefined,
            this.isSocialAddressIncludes(SocialAddressType.NEXT_ID, includes)
                ? this.getSocialAddressFromNextID(identity)
                : undefined,
            this.isSocialAddressIncludes(SocialAddressType.KV, includes)
                ? this.getSocialAddressFromKV(identity)
                : undefined,
        ])

        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : undefined)).filter(Boolean) as Array<
            SocialAddress<NetworkPluginID.PLUGIN_EVM>
        >
    }
}
