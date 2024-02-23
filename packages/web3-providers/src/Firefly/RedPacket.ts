import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
    getSiteType,
    EnhanceableSite,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import { FireflyRedPacketAPI } from '../entry-types.js'

const siteType = getSiteType()
const SITE_URL = siteType === EnhanceableSite.Firefly ? location.origin : 'https://firefly.mask.social'
const FIREFLY_ROOT_URL = process.env.NEXT_PUBLIC_FIREFLY_API_URL || 'https://api.firefly.land'

function fetchFireflyJSON<T>(url: string, init?: RequestInit): Promise<T> {
    return fetchJSON<T>(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    })
}

export class FireflyRedPacket {
    static async getPayloadUrls(
        from: string,
        amount?: string,
        type?: string,
        symbol?: string,
        decimals?: number,
    ): Promise<Array<{ themeId: string; url: string }>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/themeList')
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeListResponse>(url)

        return data.list.map((theme) => ({
            themeId: theme.tid,
            url: urlcat(SITE_URL, '/api/rp', {
                'theme-id': theme.tid,
                usage: 'payload',
                from,
                amount,
                type,
                symbol,
                decimals,
            }),
        }))
    }

    static async getCoverUrlByRpid(
        rpid: string,
        symbol?: string,
        decimals?: number,
        shares?: number,
        amount?: string,
        from?: string,
        message?: string,
        remainingAmount?: string,
        remainingShares?: string,
    ) {
        const url = urlcat(FIREFLY_ROOT_URL, 'v1/redpacket/themeById', {
            rpid,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeByIdResponse>(url)
        return {
            themeId: data.tid,
            url: urlcat(SITE_URL, '/api/rp', {
                'theme-id': data.tid,
                usage: 'cover',
                symbol,
                decimals,
                shares,
                amount,
                from,
                message,
                'remaining-amount': remainingAmount,
                'remaining-shares': remainingShares,
            }),
        }
    }

    static getPayloadUrlByThemeId(
        themeId: string,
        from: string,
        amount?: string,
        type?: string,
        symbol?: string,
        decimals?: number,
    ) {
        return urlcat(SITE_URL, '/api/rp', {
            'theme-id': themeId,
            usage: 'payload',
            from,
            amount,
            type,
            symbol,
            decimals,
        })
    }

    static async createPublicKey(
        themeId: string,
        shareFrom: string,
        payloads: FireflyRedPacketAPI.StrategyPayload[],
    ): Promise<HexString> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/createPublicKey')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.PublicKeyResponse>(url, {
            method: 'POST',
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
        publicKey: string,
    ): Promise<void> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/updateClaimStrategy')
        await fetchFireflyJSON(url, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                rpid,
                postReaction: reactions,
                claimPlatform,
            }),
        })
    }

    static async createClaimSignature(
        options: FireflyRedPacketAPI.CheckClaimStrategyStatusOptions,
    ): Promise<HexString> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claim')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.ClaimResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
        return data.signedMessage
    }

    static async getHistory<
        T extends FireflyRedPacketAPI.ActionType,
        R = T extends FireflyRedPacketAPI.ActionType.Claim ? FireflyRedPacketAPI.RedPacketClaimedInfo
        :   FireflyRedPacketAPI.RedPacketSentInfo,
    >(
        actionType: T,
        from: HexString,
        platform: FireflyRedPacketAPI.SourceType,
        indicator?: PageIndicator,
    ): Promise<Pageable<R, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/history', {
            address: from,
            redpacketType: actionType,
            claimFrom: platform,
            cursor: indicator?.id,
            size: 20,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.HistoryResponse>(url, {
            method: 'GET',
        })
        return createPageable(
            data.list.map((v) => ({ ...v, chain_id: Number(v.chain_id) })) as R[],
            createIndicator(indicator),
            createNextIndicator(indicator, data.cursor?.toString()),
        )
    }

    static async getClaimHistory(
        redpacket_id: string,
        indicator?: PageIndicator,
    ): Promise<FireflyRedPacketAPI.RedPacketClaimListInfo> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claimHistory', {
            redpacketId: redpacket_id,
            cursor: indicator?.id,
            size: 20,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.ClaimHistoryResponse>(url, {
            method: 'GET',
        })
        return { ...data, chain_id: Number(data.chain_id) }
    }

    static async checkClaimStrategyStatus(options: FireflyRedPacketAPI.CheckClaimStrategyStatusOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/checkClaimStrategyStatus')
        return fetchFireflyJSON<FireflyRedPacketAPI.CheckClaimStrategyStatusResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
    }
}
