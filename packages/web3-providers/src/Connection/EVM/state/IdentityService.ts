import { compact, first, uniqBy } from 'lodash-es'
import type { Plugin } from '@masknet/plugin-infra'
import {
    NetworkPluginID,
    EMPTY_LIST,
    EnhanceableSite,
    getSiteType,
    NextIDPlatform,
    createLookupTableResolver,
    PluginID,
    type BindingProof,
    type SocialIdentity,
    type SocialAddress,
    SocialAddressType,
} from '@masknet/shared-base'
import { ChainId, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import {
    ARBID,
    ENS,
    Lens,
    MaskX,
    NextIDProof,
    NextIDStorageProvider,
    RSS3,
    SpaceID,
    Twitter,
} from '@masknet/web3-providers'
import { MaskX_BaseAPI } from '@masknet/web3-providers/types'
import { captureAsyncTransaction } from '@masknet/web3-providers/helpers'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { IdentityServiceState } from '../../Base/state/Identity.js'

const ENS_RE = /[^\s()[\]]{1,256}\.(eth|kred|xyz|luxe)\b/gi
const SID_RE = /[^\s()[\]]{1,256}\.bnb\b/gi
const ARBID_RE = /[^\s()[\]]{1,256}\.arb\b/gi
const ADDRESS_FULL = /0x\w{40,}/i
const CROSSBELL_HANDLE_RE = /[\w.]+\.csb/gi
const LENS_RE = /[^\s()[\]]{1,256}\.lens\b/i
const LENS_URL_RE = /https?:\/\/.+\/(\w+\.lens)/
const LENS_DOMAIN_RE = /[a-z][\d_a-z]{4,25}\.lens/

function getENSNames(userId: string, nickname: string, bio: string) {
    return [userId.match(ENS_RE), nickname.match(ENS_RE), bio.match(ENS_RE)].flatMap((result) => result ?? [])
}

function getLensNames(nickname: string, bio: string, homepage: string) {
    const homepageNames = homepage.match(LENS_URL_RE)
    const names = [nickname.match(LENS_RE), bio.match(LENS_RE)].map((result) => result?.[0] ?? '')
    return [...names, homepageNames?.[1]].map((x) => first(x?.match(LENS_DOMAIN_RE)) ?? '').filter(Boolean)
}

function getARBIDNames(userId: string, nickname: string, bio: string) {
    return [userId.match(ARBID_RE), nickname.match(ARBID_RE), bio.match(ARBID_RE)].flatMap((result) => result ?? [])
}

export function getSIDNames(userId: string, nickname: string, bio: string) {
    return [userId.match(SID_RE), nickname.match(SID_RE), bio.match(SID_RE)]
        .flatMap((result) => result || [])
        .map((x) => x.toLowerCase())
}

function getCrossBellHandles(nickname: string, bio: string) {
    return [nickname.match(CROSSBELL_HANDLE_RE), bio.match(CROSSBELL_HANDLE_RE)]
        .flatMap((result) => result || [])
        .map((x) => x.toLowerCase())
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

    const latestActivatedBinding = await NextIDProof.queryLatestBindingByPlatform(
        platform,
        identifier.userId,
        publicKey,
    )
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

    /** Read a social address from bio when it contains a csb handle. */
    private async getSocialAddressFromCrossbell({ nickname = '', bio = '' }: SocialIdentity) {
        const handles = getCrossBellHandles(nickname, bio)
        if (!handles.length) return

        const allSettled = await Promise.allSettled(
            handles.map(async (handle) => {
                const info = await RSS3.getNameInfo(handle)
                if (!info?.crossbell) return
                return this.createSocialAddress(SocialAddressType.Crossbell, info.address, info.crossbell)
            }),
        )
        return compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)).filter(Boolean))
    }

    /** Read a social address from avatar NextID storage. */
    private async getSocialAddressFromAvatarNextID({ identifier, publicKey }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId || !publicKey) return

        const response = await NextIDStorageProvider.getByIdentity<{ ownerAddress?: string }>(
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
                const address = await ENS.lookup(name)
                if (!address) return
                return this.createSocialAddress(SocialAddressType.ENS, address, name)
            }),
        )
        return uniqBy(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))), (x) =>
            x.address.toLowerCase(),
        )
    }

    private async getSocialAddressFromARBID({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getARBIDNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await ARBID.lookup(name)
                if (!address) return
                return this.createSocialAddress(SocialAddressType.SPACE_ID, address, name, ChainId.Arbitrum)
            }),
        )
        return uniqBy(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))), (x) =>
            x.address.toLowerCase(),
        )
    }

    private async getSocialAddressFromSpaceID({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getSIDNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await SpaceID.lookup(name)
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
        const connection = Web3StateRef.value.Connection?.getConnection?.({
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
                    const name = await ENS.reverse(y.web3_addr)

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
            captureAsyncTransaction('getSocialAddressFromBio', this.getSocialAddressFromBio(identity)),
            captureAsyncTransaction('getSocialAddressFromENS', this.getSocialAddressFromENS(identity)),
            captureAsyncTransaction('getSocialAddressFromSpaceID', this.getSocialAddressFromSpaceID(identity)),
            captureAsyncTransaction('getSocialAddressFromARBID', this.getSocialAddressFromARBID(identity)),
            captureAsyncTransaction(
                'getSocialAddressFromAvatarNextID',
                this.getSocialAddressFromAvatarNextID(identity),
            ),
            captureAsyncTransaction('getSocialAddressFromCrossbell', this.getSocialAddressFromCrossbell(identity)),
            captureAsyncTransaction('getSocialAddressFromTwitterBlue', this.getSocialAddressFromTwitterBlue(identity)),
            captureAsyncTransaction('getSocialAddressesFromNextID', this.getSocialAddressesFromNextID(identity)),
            captureAsyncTransaction('getSocialAddressesFromMaskX', this.getSocialAddressesFromMaskX(identity)),
            captureAsyncTransaction('getSocialAddressFromLens', this.getSocialAddressFromLens(identity)),
        ])
        const identities_ = allSettled
            .flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
            .filter(Boolean) as Array<SocialAddress<ChainId>>

        const identities = uniqBy(identities_, (x) => [x.type, x.label, x.address.toLowerCase()].join('_'))
        if (!getNextIDPlatform() || !(process.env.channel === 'stable' && process.env.NODE_ENV === 'production')) {
            return identities
        }
        const identitiesFromNextID = await this.getSocialAddressesFromNextID(identity)
        const allSettledIdentitiesVerified = await Promise.allSettled(
            uniqBy(identities, (x) => x.address.toLowerCase()).map(async (x) => {
                const isVerified = await NextIDProof.verifyTwitterHandlerByAddress(
                    x.address,
                    identity.identifier?.userId ?? '',
                )
                return { ...x, isVerified }
            }),
        )

        return uniqBy(
            (
                allSettledIdentitiesVerified
                    .flatMap((x) => (x.status === 'fulfilled' && x.value.isVerified ? x.value : undefined))
                    .filter(Boolean) as Array<SocialAddress<ChainId>>
            ).concat(identitiesFromNextID),
            (x) => x.address.toLowerCase(),
        )
    }
}
