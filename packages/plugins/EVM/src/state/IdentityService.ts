import { uniqBy } from 'lodash-unified'
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
} from '@masknet/shared-base'
import { ChainId, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { KeyValue, MaskX, MaskX_BaseAPI, NextIDProof, Twitter } from '@masknet/web3-providers'
import { ENS_Resolver } from './NameService/ENS.js'
import { ChainbaseResolver } from './NameService/Chainbase.js'
import { Web3StateSettings } from '../settings/index.js'

const ENS_RE = /[^\t\n\v()[\]]{1,256}\.(eth|kred|xyz|luxe)\b/i
const ADDRESS_FULL = /0x\w{40,}/i

function getENSName(username: string, nickname: string, bio: string) {
    const [matched] = username.match(ENS_RE) ?? nickname.match(ENS_RE) ?? bio.match(ENS_RE) ?? []
    return matched
}

function getAddress(text: string) {
    const [matched] = text.match(ADDRESS_FULL) ?? []
    if (matched && isValidAddress(matched)) return matched
    return
}

function getNextIDPlatform() {
    if (getSiteType() === EnhanceableSite.Twitter) return NextIDPlatform.Twitter
    return NextIDPlatform.Twitter
}

async function getWalletAddressesFromNextID(userId?: string, publicKey?: string) {
    if (!userId || !publicKey) return EMPTY_LIST
    const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(getNextIDPlatform(), userId)
    return bindings.flatMap((x) =>
        x.proofs.filter((y) => y.platform === NextIDPlatform.Ethereum && isValidAddress(y.identity)),
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

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedUIContext) {
        super()
    }

    private createSocialAddress(
        type: SocialAddressType,
        address: string,
        label = address,
        updatedAt?: string,
        createdAt?: string,
    ): SocialAddress<NetworkPluginID.PLUGIN_EVM> | undefined {
        if (isValidAddress(address) && !isZeroAddress(address))
            return {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                type,
                label,
                address,
                updatedAt,
                createdAt,
            }
        return
    }

    /** Read a social address from username. */
    private async getSocialAddressFromUsername({ identifier }: SocialIdentity) {
        if (!identifier?.userId) return
        const name = getENSName(identifier.userId, '', '')
        if (!name) return
        const address = await attemptUntil(
            [new ENS_Resolver(), new ChainbaseResolver()].map((resolver) => {
                return async () => resolver.lookup(name)
            }),
            undefined,
        )
        if (!address) return
        return this.createSocialAddress(SocialAddressType.ENS, address, name)
    }

    /** Read a social address from bio. */
    private async getSocialAddressFromBio({ bio = '' }: SocialIdentity) {
        const address = getAddress(bio)
        if (!address) return
        return this.createSocialAddress(SocialAddressType.ADDRESS, address)
    }

    /** Read a social address from NextID. */
    private async getSocialAddressesFromNextID({ identifier, publicKey }: SocialIdentity) {
        const listOfAddress = await getWalletAddressesFromNextID(identifier?.userId, publicKey)
        return listOfAddress
            .map((x) =>
                this.createSocialAddress(SocialAddressType.NEXT_ID, x.identity, x.latest_checked_at, x.created_at),
            )
            .filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_EVM>>
    }

    /** Read a social address from KV service. */
    private async getSocialAddressFromKV({ identifier }: SocialIdentity) {
        const address = await KeyValue.createJSON_Storage<
            Record<
                NetworkPluginID,
                {
                    address: string
                    networkPluginID: NetworkPluginID
                }
            >
        >(`com.maskbook.user_${getSiteType()}`)
            .get(identifier?.userId ?? '$unknown')
            .then((x) => x?.[NetworkPluginID.PLUGIN_EVM].address ?? '')

        return this.createSocialAddress(SocialAddressType.KV, address)
    }

    /** Read a social address from nickname, bio if them contain a ENS. */
    private async getSocialAddressFromENS({ nickname = '', bio = '' }: SocialIdentity) {
        const name = getENSName('', nickname, bio)
        if (!name) return

        const address = await attemptUntil(
            [new ENS_Resolver(), new ChainbaseResolver()].map((resolver) => {
                return async () => resolver.lookup(name)
            }),
            undefined,
        )
        if (!address) return
        return this.createSocialAddress(SocialAddressType.ENS, address, name)
    }

    /** Read a social address from Twitter Blue. */
    private async getSocialAddressFromTwitterBlue({ identifier }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId) return
        const response = await Twitter.getUserNftContainer(userId)
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: ChainId.Mainnet,
        })
        const ownerAddress = await connection?.getNonFungibleTokenOwner(response.address, response.token_id)
        if (!ownerAddress || !isValidAddress(ownerAddress)) return
        return this.createSocialAddress(SocialAddressType.TwitterBlue, ownerAddress)
    }

    /** Read a social address from MaskX */
    private async getSocialAddressesFromMaskX({ identifier }: SocialIdentity) {
        const userId = identifier?.userId
        if (!userId) return
        const response = await MaskX.getIdentitiesExact(userId, MaskX_BaseAPI.PlatformType.Twitter)
        return response.records
            .filter((x) => {
                if (!isValidAddress(x.web3_addr)) return false
                try {
                    // detect if a valid data source
                    resolveMaskXAddressType(x.source)
                    return true
                } catch {
                    return false
                }
            })
            .map((y) => this.createSocialAddress(resolveMaskXAddressType(y.source), y.web3_addr, y.sns_handle))
    }

    override async getFromRemote(identity: SocialIdentity, includes?: SocialAddressType[]) {
        const allSettled = await Promise.allSettled([
            this.getSocialAddressFromBio(identity),
            this.getSocialAddressFromENS(identity),
            this.getSocialAddressFromKV(identity),
            this.getSocialAddressFromTwitterBlue(identity),
            this.getSocialAddressesFromNextID(identity),
            this.getSocialAddressesFromMaskX(identity),
            this.getSocialAddressFromUsername(identity),
        ])

        console.log('DEBUG: get from response')
        console.log(allSettled)

        const identities = allSettled
            .flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
            .filter(Boolean) as Array<SocialAddress<NetworkPluginID.PLUGIN_EVM>>
        console.log('------------------')
        console.log(identities)
        return uniqBy(identities, (x) => `${x.type}_${x.label}_${x.address.toLowerCase()}`)
    }
}
