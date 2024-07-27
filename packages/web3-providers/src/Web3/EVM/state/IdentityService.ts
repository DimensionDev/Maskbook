import {
    NetworkPluginID,
    NextIDPlatform,
    PluginID,
    SocialAddressType,
    createLookupTableResolver,
    type SocialAddress,
    type SocialIdentity,
} from '@masknet/shared-base'
import { type ChainId, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { compact, uniqBy } from 'lodash-es'
import * as ENS from /* webpackDefer: true */ '../../../ENS/index.js'
import { BaseMaskX } from '../../../entry-types.js'
import * as Firefly from /* webpackDefer: true */ '../../../Firefly/index.js'
import * as Lens from /* webpackDefer: true */ '../../../Lens/index.js'
import * as MaskX from /* webpackDefer: true */ '../../../MaskX/index.js'
import * as NextIDStorageProvider from /* webpackDefer: true */ '../../../NextID/kv.js'
import { IdentityServiceState } from '../../Base/state/IdentityService.js'

const ENS_RE = /[^\s()[\]]{1,256}\.(eth|kred|xyz|luxe)\b/gi
const SID_RE = /[^\s()[\]]{1,256}\.bnb\b/gi
const LENS_RE = /[^\s()[\]]{1,256}\.lens\b/i
const LENS_URL_RE = /https?:\/\/.+\/(\w+\.lens)/

function getENSNames(userId: string, nickname: string, bio: string) {
    return [userId.match(ENS_RE), nickname.match(ENS_RE), bio.match(ENS_RE)].flatMap((result) => result ?? [])
}

function getLensNames(nickname: string, bio: string, homepage: string) {
    const homepageNames = homepage.match(LENS_URL_RE)?.[1]
    const names = [nickname.match(LENS_RE), bio.match(LENS_RE)].map((result) => result?.[0] ?? '')
    return [...names, homepageNames].filter(Boolean) as string[]
}

function getSIDNames(userId: string, nickname: string, bio: string) {
    return [userId.match(SID_RE), nickname.match(SID_RE), bio.match(SID_RE)]
        .flatMap((result) => result || [])
        .map((x) => x.toLowerCase())
}

const resolveMaskXAddressType = createLookupTableResolver<BaseMaskX.SourceType, SocialAddressType>(
    {
        [BaseMaskX.SourceType.CyberConnect]: SocialAddressType.CyberConnect,
        [BaseMaskX.SourceType.Firefly]: SocialAddressType.Firefly,
        [BaseMaskX.SourceType.HandWriting]: SocialAddressType.Firefly,
        [BaseMaskX.SourceType.Leaderboard]: SocialAddressType.Leaderboard,
        [BaseMaskX.SourceType.OpenSea]: SocialAddressType.OpenSea,
        [BaseMaskX.SourceType.Sybil]: SocialAddressType.Sybil,
        [BaseMaskX.SourceType.Uniswap]: SocialAddressType.Sybil,
        [BaseMaskX.SourceType.RSS3]: SocialAddressType.RSS3,
        [BaseMaskX.SourceType.TwitterHexagon]: SocialAddressType.TwitterBlue,
    },
    (x) => {
        throw new Error(`Unknown source type: ${x}`)
    },
)

export class EVMIdentityService extends IdentityServiceState<ChainId> {
    private createSocialAddress(
        type: SocialAddressType,
        address: string,
        label = '',
        chainId?: ChainId,
        updatedAt?: string,
        createdAt?: string,
        verified?: boolean,
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
                verified,
            }
        }
        return
    }

    /** Read a social address from avatar NextID storage. */
    private async getSocialAddressFromAvatarNextID({ identifier, publicKey }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId || !publicKey) return

        const response = await NextIDStorageProvider.NextIDStorageProvider.getByIdentity<{ ownerAddress?: string }>(
            publicKey,
            NextIDPlatform.Twitter,
            userId.toLowerCase(),
            PluginID.Avatar,
        )

        if (!response.isOk() || !response.value.ownerAddress) return
        return this.createSocialAddress(SocialAddressType.Mask, response.value.ownerAddress)
    }

    /** Read a social address from nickname, bio if them contain a ENS. */
    private async getSocialAddressFromENS({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getENSNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await ENS.ENS.lookup(name)
                if (!address) return
                return [
                    this.createSocialAddress(SocialAddressType.ENS, address, name),
                    this.createSocialAddress(SocialAddressType.Address, address, name),
                ]
            }),
        )
        return compact(allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : undefined)))
    }

    private async getSocialAddressFromLens({ nickname = '', bio = '', homepage = '' }: SocialIdentity) {
        const names = getLensNames(nickname, bio, homepage)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const profile = await Lens.Lens.getProfileByHandle(name)
                if (!profile) return
                return [
                    this.createSocialAddress(SocialAddressType.Lens, profile.ownedBy.address, name),
                    this.createSocialAddress(SocialAddressType.Address, profile.ownedBy.address, name),
                ]
            }),
        )
        return compact(allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : undefined)))
    }

    /** Read social addresses from MaskX */
    private async getSocialAddressesFromMaskX({ identifier }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId) return

        const { records } = await MaskX.MaskX.getIdentitiesExact(userId, BaseMaskX.PlatformType.Twitter)
        const results = records.filter((x) => {
            if (!isValidAddress(x.web3_addr) || !x.is_verified) return false

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
                    const name = await ENS.ENS.reverse(y.web3_addr)

                    return this.createSocialAddress(resolveMaskXAddressType(y.source), y.web3_addr, name)
                } catch {
                    return this.createSocialAddress(resolveMaskXAddressType(y.source), y.web3_addr)
                }
            }),
        )
        return compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)))
    }

    override async getFromRemote(identity: SocialIdentity, includes?: SocialAddressType[]) {
        const socialAddressFromMaskX = this.getSocialAddressesFromMaskX(identity)
        const allSettled = await Promise.allSettled([
            this.getSocialAddressFromENS(identity),
            this.getSocialAddressFromAvatarNextID(identity),
            socialAddressFromMaskX,
            this.getSocialAddressFromLens(identity),
        ])
        const mergedIdentities = compact(allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : [])))

        const identities = uniqBy(mergedIdentities, (x) => [x.type, x.label, x.address.toLowerCase()].join('_'))

        const handle = identity.identifier?.userId
        if (!handle) return []
        // Identity is address type, will check if it's verified by Firefly
        const verifiedHandleMap = new Map<string, string[]>()
        const verifiedResult = await Promise.allSettled(
            uniqBy(identities, (x) => x.address.toLowerCase()).map(async (x) => {
                const address = x.address.toLowerCase()
                if (x.verified) return address
                const verifiedHandles = await Firefly.FireflyConfig.getVerifiedHandles(address)
                verifiedHandleMap.set(address, verifiedHandles)
                return verifiedHandles.includes(handle) ? address : null
            }),
        )
        const trustedAddresses = compact(verifiedResult.map((x) => (x.status === 'fulfilled' ? x.value : null)))

        const result = identities.filter((x) => {
            const address = x.address.toLowerCase()
            if (trustedAddresses.includes(address)) return true
            if (x.type === SocialAddressType.Address) {
                const handles = verifiedHandleMap.get(address) || []
                return handles.length ? handles.includes(handle) : true
            }
            return false
        })
        return result
    }
}
