import { compact, uniqBy } from 'lodash-es'
import type { Plugin } from '@masknet/plugin-infra'
import { IdentityServiceState } from '@masknet/web3-state'
import { SocialIdentity, SocialAddress, SocialAddressType, attemptUntil } from '@masknet/web3-shared-base'
import {
    NetworkPluginID,
    EMPTY_LIST,
    EnhanceableSite,
    getSiteType,
    NextIDPlatform,
    createLookupTableResolver,
    PluginID,
    BindingProof,
} from '@masknet/shared-base'
import { KVStorage } from '@masknet/shared'
import { ChainId, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { Lens, MaskX, NextIDProof, NextIDStorage, RSS3, Twitter } from '@masknet/web3-providers'
import { MaskX_BaseAPI } from '@masknet/web3-providers/types'
import { ENS_Resolver } from './NameService/ENS.js'
import { SpaceID_Resolver } from './NameService/SpaceID.js'
import { Web3StateSettings } from '../settings/index.js'
import { GraphQLResolver } from './NameService/GraphQL.js'
import { ThegraphResolver } from './NameService/Thegraph.js'

const ENS_RE = /[^\s()[\]]{1,256}\.(eth|kred|xyz|luxe)\b/gi
const SID_RE = /[^\t\n\v()[\]]{1,256}\.bnb\b/gi
const ADDRESS_FULL = /0x\w{40,}/i
const RSS3_URL_RE = /https?:\/\/(?<name>[\w.]+)\.(rss3|cheers)\.bio/
const RSS3_RNS_RE = /(?<name>[\w.]+)\.rss3/
const LENS_RE = /[^\s()[\]]{1,256}\.lens\b/i
const LENS_URL_RE = /https?:\/\/.+\/(\w+\.lens)/

function getENSNames(userId: string, nickname: string, bio: string) {
    return [userId.match(ENS_RE), nickname.match(ENS_RE), bio.match(ENS_RE)].flatMap((result) => result ?? [])
}

function getLensNames(nickname: string, bio: string, homepage: string) {
    const homepageNames = homepage.match(LENS_URL_RE)
    const names = [nickname.match(LENS_RE), bio.match(LENS_RE)].map((result) => result?.[0] ?? '').filter(Boolean)
    return homepageNames === null || !homepageNames?.[1] ? names : [...names, homepageNames[1]]
}

function getSIDNames(userId: string, nickname: string, bio: string) {
    return [userId.match(SID_RE), nickname.match(SID_RE), bio.match(SID_RE)].flatMap((result) => result ?? [])
}

function getRSS3Ids(nickname: string, profileURL: string, bio: string) {
    return [nickname.match(RSS3_RNS_RE), profileURL.match(RSS3_URL_RE), bio.match(RSS3_URL_RE), bio.match(RSS3_RNS_RE)]
        .map((result) => result?.groups?.name ?? '')
        .filter(Boolean)
}

function getAddress(text: string) {
    const [matched] = text.match(ADDRESS_FULL) ?? []
    if (matched && isValidAddress(matched)) return matched
    return
}

function getNextIDPlatform() {
    if (getSiteType() === EnhanceableSite.Twitter) return NextIDPlatform.Twitter
    return
}

async function getWalletAddressesFromNextID({ identifier, publicKey }: SocialIdentity): Promise<BindingProof[]> {
    if (!identifier?.userId) return EMPTY_LIST

    const platform = getNextIDPlatform()
    if (!platform) return EMPTY_LIST

    const latestActivatedBinding = await NextIDProof.queryLatestBindingByPlatform(platform, identifier.userId)
    if (!latestActivatedBinding) return EMPTY_LIST
    return latestActivatedBinding.proofs.filter(
        (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
    )
}

const resolveMaskXAddressType = createLookupTableResolver<MaskX_BaseAPI.SourceType, SocialAddressType>(
    {
        [MaskX_BaseAPI.SourceType.CyberConnect]: SocialAddressType.CyberConnect,
        [MaskX_BaseAPI.SourceType.Leaderboard]: SocialAddressType.Leaderboard,
        [MaskX_BaseAPI.SourceType.Sybil]: SocialAddressType.Sybil,
        [MaskX_BaseAPI.SourceType.RSS3]: SocialAddressType.RSS3,
    },
    (x) => {
        throw new Error(`Unknown source type: ${x}`)
    },
)

export class IdentityService extends IdentityServiceState<ChainId> {
    private KV = new KVStorage(`com.maskbook.user_${getSiteType()}`)

    constructor(protected context: Plugin.Shared.SharedUIContext) {
        super()
    }

    private createSocialAddress(
        type: SocialAddressType,
        address: string,
        label = '',
        chainId?: ChainId,
        updatedAt?: string,
        createdAt?: string,
    ): SocialAddress<ChainId> | undefined {
        if (isValidAddress(address) && !isZeroAddress(address)) {
            return {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId,
                type,
                label,
                address,
                updatedAt,
                createdAt,
            }
        }
        return
    }

    /** Read a social address from bio. */
    private async getSocialAddressFromBio({ bio = '' }: SocialIdentity) {
        const address = getAddress(bio)
        if (!address) return
        return this.createSocialAddress(SocialAddressType.Address, address)
    }

    /** Read a social address from bio when it contains a RSS3 ID. */
    private async getSocialAddressFromRSS3({ nickname = '', homepage = '', bio = '' }: SocialIdentity) {
        const ids = getRSS3Ids(nickname, homepage, bio)
        if (!ids.length) return

        const allSettled = await Promise.allSettled(
            ids.map(async (id) => {
                const info = await RSS3.getNameInfo(id)
                return this.createSocialAddress(SocialAddressType.RSS3, info?.address ?? '', `${id}.rss3`)
            }),
        )
        return compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)).filter(Boolean))
    }

    /** Read a social address from avatar NextID storage. */
    private async getSocialAddressFromAvatarNextID({ identifier, publicKey }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId || !publicKey) return

        const response = await NextIDStorage.getByIdentity<{ ownerAddress?: string }>(
            publicKey,
            NextIDPlatform.Twitter,
            userId.toLowerCase(),
            PluginID.Avatar,
        )

        if (!response.ok || !response.val.ownerAddress) return
        return this.createSocialAddress(SocialAddressType.Mask, response.val.ownerAddress)
    }

    /** Read a social address from NextID. */
    private async getSocialAddressesFromNextID(identity: SocialIdentity) {
        const listOfAddress = await getWalletAddressesFromNextID(identity)
        return compact(
            listOfAddress.map((x) =>
                this.createSocialAddress(
                    SocialAddressType.NEXT_ID,
                    x.identity,
                    '',
                    undefined,
                    x.latest_checked_at,
                    x.created_at,
                ),
            ),
        )
    }

    /** Read a social address from nickname, bio if them contain a ENS. */
    private async getSocialAddressFromENS({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getENSNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await attemptUntil(
                    [new ENS_Resolver(), new GraphQLResolver(), new ThegraphResolver()].map((resolver) => {
                        return async () => resolver.lookup(name)
                    }),
                    undefined,
                )
                if (!address) return
                return this.createSocialAddress(SocialAddressType.ENS, address, name)
            }),
        )
        return uniqBy(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))), (x) =>
            x.address.toLowerCase(),
        )
    }

    private async getSocialAddressFromSpaceID({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getSIDNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const resolver = new SpaceID_Resolver()

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await resolver.lookup(name)
                if (!address) return
                return this.createSocialAddress(SocialAddressType.SPACE_ID, address, name, ChainId.BSC)
            }),
        )
        return uniqBy(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))), (x) =>
            x.address.toLowerCase(),
        )
    }

    private async getSocialAddressFromLens({ nickname = '', bio = '', homepage = '' }: SocialIdentity) {
        const names = getLensNames(nickname, bio, homepage)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const profile = await Lens.getProfileByHandle(name)
                if (!profile) return
                return this.createSocialAddress(SocialAddressType.Lens, profile.ownedBy, name)
            }),
        )
        return compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)).filter(Boolean))
    }

    /** Read a social address from Twitter Blue. */
    private async getSocialAddressFromTwitterBlue({ identifier }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId) return

        const response = await Twitter.getUserNftContainer(userId)
        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId: ChainId.Mainnet,
        })
        if (!response) return
        const ownerAddress = await connection?.getNonFungibleTokenOwner(response.address, response.token_id)
        if (!ownerAddress || !isValidAddress(ownerAddress)) return
        return this.createSocialAddress(SocialAddressType.TwitterBlue, ownerAddress)
    }

    /** Read social addresses from MaskX */
    private async getSocialAddressesFromMaskX({ identifier }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId) return

        const response = await MaskX.getIdentitiesExact(userId, MaskX_BaseAPI.PlatformType.Twitter)
        const results = response.records.filter((x) => {
            if (
                !isValidAddress(x.web3_addr) ||
                ![
                    MaskX_BaseAPI.SourceType.CyberConnect,
                    MaskX_BaseAPI.SourceType.Leaderboard,
                    MaskX_BaseAPI.SourceType.Sybil,
                ].includes(x.source)
            )
                return false

            try {
                // detect if a valid data source
                resolveMaskXAddressType(x.source)
                return true
            } catch {
                return false
            }
        })

        const allSettled = await Promise.allSettled(
            results.map(async (y) => {
                try {
                    const name = await attemptUntil(
                        [new ENS_Resolver(), new GraphQLResolver(), new ThegraphResolver()].map((resolver) => {
                            return async () => resolver.reverse(y.web3_addr)
                        }),
                        undefined,
                        () => false,
                    )

                    return this.createSocialAddress(
                        resolveMaskXAddressType(y.source),
                        y.web3_addr,
                        name ?? y.sns_handle,
                    )
                } catch {
                    return this.createSocialAddress(resolveMaskXAddressType(y.source), y.web3_addr, y.sns_handle)
                }
            }),
        )
        return compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)))
    }

    override async getFromRemote(identity: SocialIdentity, includes?: SocialAddressType[]) {
        const allSettled = await Promise.allSettled([
            this.getSocialAddressFromBio(identity),
            this.getSocialAddressFromENS(identity),
            this.getSocialAddressFromSpaceID(identity),
            this.getSocialAddressFromAvatarNextID(identity),
            this.getSocialAddressFromRSS3(identity),
            this.getSocialAddressFromTwitterBlue(identity),
            this.getSocialAddressesFromNextID(identity),
            this.getSocialAddressesFromMaskX(identity),
            this.getSocialAddressFromLens(identity),
        ])
        const identities = allSettled
            .flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
            .filter(Boolean) as Array<SocialAddress<ChainId>>
        return uniqBy(identities, (x) => [x.type, x.label, x.address.toLowerCase()].join('_'))
    }
}
