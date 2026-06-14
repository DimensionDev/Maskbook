import { compact, uniqBy } from 'lodash-es'
import {
    NetworkPluginID,
    SocialAddressType,
    createLookupTableResolver,
    type SocialAddress,
    type SocialIdentity,
} from '@masknet/shared-base'
import { ChainId, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { IdentityServiceState } from '../../Base/state/IdentityService.js'
import { BaseMaskX } from '../../../entry-types.js'
import defer * as ARBID from '../../../ARBID/index.js'
import defer * as ENS from '../../../ENS/index.js'
import defer * as Firefly from '../../../Firefly/index.js'
import defer * as MaskX from '../../../MaskX/index.js'
import defer * as RSS3 from '../../../RSS3/index.js'
import defer * as SpaceID from '../../../SpaceID/index.js'

// cspell:disable-next-line
const ENS_RE = /[^\s()[\]]{1,256}\.(eth|kred|xyz|luxe)\b/giu
const SID_RE = /[^\s()[\]]{1,256}\.bnb\b/giu
const ARBID_RE = /[^\s()[\]]{1,256}\.arb\b/giu
const CROSSBELL_HANDLE_RE = /[\w.]+\.csb/giu

function getENSNames(userId: string, nickname: string, bio: string) {
    return [userId.match(ENS_RE), nickname.match(ENS_RE), bio.match(ENS_RE)].flatMap((result) => result ?? [])
}

function getARBIDNames(userId: string, nickname: string, bio: string) {
    return [userId.match(ARBID_RE), nickname.match(ARBID_RE), bio.match(ARBID_RE)].flatMap((result) => result ?? [])
}

function getSIDNames(userId: string, nickname: string, bio: string) {
    return [userId.match(SID_RE), nickname.match(SID_RE), bio.match(SID_RE)]
        .flatMap((result) => result || [])
        .map((x) => x.toLowerCase())
}

function getCrossBellHandles(nickname: string, bio: string) {
    return [nickname.match(CROSSBELL_HANDLE_RE), bio.match(CROSSBELL_HANDLE_RE)]
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

    /** Read a social address from bio when it contains a csb handle. */
    private async getSocialAddressFromCrossbell({ nickname = '', bio = '' }: SocialIdentity) {
        const handles = getCrossBellHandles(nickname, bio)
        if (!handles.length) return

        const allSettled = await Promise.allSettled(
            handles.map(async (handle) => {
                const info = await RSS3.RSS3.getNameInfo(handle)
                if (!info?.crossbell) return
                return this.createSocialAddress(SocialAddressType.Crossbell, info.address, info.crossbell)
            }),
        )
        return compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)))
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

    private async getSocialAddressFromARBID({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getARBIDNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await ARBID.ARBID.lookup(name)
                if (!address) return
                return [
                    this.createSocialAddress(SocialAddressType.ARBID, address, name, ChainId.Arbitrum),
                    this.createSocialAddress(SocialAddressType.Address, address, name, ChainId.Arbitrum),
                ]
            }),
        )
        return compact(allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : undefined)))
    }

    private async getSocialAddressFromSpaceID({ identifier, nickname = '', bio = '' }: SocialIdentity) {
        const names = getSIDNames(identifier?.userId ?? '', nickname, bio)
        if (!names.length) return

        const allSettled = await Promise.allSettled(
            names.map(async (name) => {
                const address = await SpaceID.SpaceID.lookup(name)
                if (!address) return
                return [
                    this.createSocialAddress(SocialAddressType.SPACE_ID, address, name, ChainId.BSC),
                    this.createSocialAddress(SocialAddressType.Address, address, name, ChainId.BSC),
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

    override async getFromRemote(identity: SocialIdentity) {
        const socialAddressFromMaskX = this.getSocialAddressesFromMaskX(identity)
        const allSettled = await Promise.allSettled([
            this.getSocialAddressFromENS(identity),
            this.getSocialAddressFromSpaceID(identity),
            this.getSocialAddressFromARBID(identity),
            this.getSocialAddressFromCrossbell(identity),
            socialAddressFromMaskX,
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
