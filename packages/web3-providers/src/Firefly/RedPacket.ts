import {
    createIndicator,
    createNextIndicator,
    createPageable,
    Sniffings,
    type Pageable,
    type PageIndicator,
    getSiteType,
    EnhanceableSite,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import { FireflyRedPacketAPI } from '../entry-types.js'

const siteType = getSiteType()
const SITE_URL = siteType === EnhanceableSite.Firefly ? location.origin : 'https://firefly-staging.mask.social'
const FIREFLY_ROOT_URL = 'https://api-dev.firefly.land'

export class FireflyRedPacket {
    static async getThemeSettings(
        from: string,
        amount?: string,
        type?: string,
        symbol?: string,
        decimals?: number,
    ): Promise<FireflyRedPacketAPI.ThemeSettings[]> {
        return [
            {
                id: 'b64f9af2-447c-471f-998a-fa7336c57849',
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'golden-flower',
                    usage: 'payload',
                    from,
                    amount,
                    type,
                    symbol,
                    decimals,
                }),
                coverUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'golden-flower',
                    usage: 'cover',
                }),
            },
            {
                id: 'e171b936-b5f5-415c-8938-fa1b74d1d612',
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'lucky-firefly',
                    usage: 'payload',
                    from,
                    amount,
                    type,
                    symbol,
                    decimals,
                }),
                coverUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'lucky-firefly',
                    usage: 'cover',
                }),
            },
            {
                id: 'e480132f-a853-43ea-bbab-883b463e55b3',
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'lucky-flower',
                    usage: 'payload',
                    from,
                    amount,
                    type,
                    symbol,
                    decimals,
                }),
                coverUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'lucky-flower',
                    usage: 'cover',
                }),
            },
        ]
    }

    static async createPublicKey(
        themeId: string,
        shareFrom: string,
        payloads: FireflyRedPacketAPI.StrategyPayload[],
    ): Promise<`0x${string}`> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/createPublicKey')
        const { data } = await fetchJSON<FireflyRedPacketAPI.PublicKeyResponse>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                themeId,
                shareFrom,
                claimFrom: FireflyRedPacketAPI.SourceType.FireflyPC,
                claimStrategy: JSON.stringify(payloads),
            }),
        })

        return data.publicKey
    }

    static async updateClaimStrategy(
        rpid: string,
        reactions: FireflyRedPacketAPI.PostReaction[],
        claimPlatform: FireflyRedPacketAPI.ClaimPlatform[],
    ): Promise<void> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/updateClaimStrategy')
        await fetchJSON(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rpid,
                postReaction: reactions,
                claimPlatform,
            }),
        })
    }

    static async createClaimSignature(
        rpid: string,
        from: HexString,
        reaction: FireflyRedPacketAPI.ProfileReaction,
    ): Promise<HexString> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claim')
        const { data } = await fetchJSON<FireflyRedPacketAPI.ClaimResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                rpid,
                profile: reaction,
                wallet: {
                    address: from,
                },
            }),
        })
        return data.signedMessage
    }

    static async getHistory<
        T extends FireflyRedPacketAPI.ActionType,
        R = T extends FireflyRedPacketAPI.ActionType.Claim ? FireflyRedPacketAPI.RedPacketClaimedInfo
        :   FireflyRedPacketAPI.RedPacketSentInfo,
    >(actionType: T, from: `0x${string}`, indicator?: PageIndicator): Promise<Pageable<R, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/history', {
            address: from,
            redpacketType: actionType,
            claimFrom: FireflyRedPacketAPI.SourceType.All,
            cursor: indicator?.id,
            size: 20,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.HistoryResponse>(url, {
            method: 'GET',
        })
        return createPageable(
            data.list as R[],
            createIndicator(indicator),
            createNextIndicator(indicator, data.cursor?.toString()),
        )
    }

    static async getClaimHistory(
        redpacket_id: string,
        indicator?: PageIndicator,
    ): Promise<FireflyRedPacketAPI.RedPacketCliamListInfo> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claimHistory', {
            redpackedId: redpacket_id,
            cursor: indicator?.id,
            size: 20,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.ClaimHistroyResponse>(url, {
            method: 'GET',
        })
        return data
    }

    static async checkClaimStrategyStatus(options: FireflyRedPacketAPI.CheckClaimStrategyStatusOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/checkClaimStrategyStatus')
        return fetchJSON<FireflyRedPacketAPI.CheckClaimStrategyStatusResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
    }
}
