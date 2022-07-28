import ENS from 'ethjs-ens'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, SocialIdentity, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { EMPTY_LIST, EnhanceableSite, getSiteType, NextIDPlatform } from '@masknet/shared-base'
import { ChainId, isValidAddress, isZeroAddress, ProviderType } from '@masknet/web3-shared-evm'
import { IdentityServiceState } from '@masknet/plugin-infra/web3'
import { KeyValue, NextIDProof, RSS3 } from '@masknet/web3-providers'
import { Providers } from './Connection/provider'

const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
const ADDRESS_FULL = /0x\w{40,}/
// xxx.cheers.bio xxx.rss3.bio
const RSS3_URL_RE = /https?:\/\/(?<name>[\w.]+)\.(rss3|cheers)\.bio/
const RSS3_RNS_RE = /(?<name>[\w.]+)\.rss3/

function getENSName(twitterId: string, nickname: string, bio: string) {
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

function getNextIDPlatform() {
    if (getSiteType() === EnhanceableSite.Twitter) return NextIDPlatform.Twitter
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
    constructor(protected context: Plugin.Shared.SharedUIContext) {
        super()
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
        const name = getENSName(identifier?.userId ?? '', nickname, bio)
        if (!name) return

        const provider = await Providers[ProviderType.MaskWallet].createWeb3Provider({
            chainId: ChainId.Mainnet,
        })
        const ens = new ENS({
            provider,
            network: ChainId.Mainnet,
        })
        return this.createSocialAddress(SocialAddressType.ENS, await ens.lookup(name), name)
    }

    override async getFromRemote(identity: SocialIdentity, includes?: SocialAddressType[]) {
        const allSettled = await Promise.allSettled([
            this.getSocialAddressFromBio(identity),
            this.getSocialAddressFromENS(identity),
            this.getSocialAddressFromRSS3(identity),
            this.getSocialAddressFromNextID(identity),
            this.getSocialAddressFromKV(identity),
        ])
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : undefined)).filter(Boolean) as Array<
            SocialAddress<NetworkPluginID.PLUGIN_EVM>
        >
    }
}
