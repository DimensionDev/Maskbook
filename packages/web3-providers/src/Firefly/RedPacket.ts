import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import { FireflyRedPacketAPI } from '../entry-types.js'

const SITE_URL = location.origin
let apiRoot = process.env.NEXT_PUBLIC_FIREFLY_API_URL || 'https://api.firefly.land'

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
    static async parse(options: FireflyRedPacketAPI.ParseOptions) {
        const url = urlcat(apiRoot, '/v1/misc/redpacket/parse')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.ParseResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
        return data
    }
    static async getPayloadUrls(from: string, amount?: string, type?: string, symbol?: string, decimals?: number) {
        const url = urlcat(apiRoot, '/v1/redpacket/themeList')
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeListResponse>(url)

        return data.list.map((theme) => ({
            themeId: theme.tid,
            backgroundImageUrl: theme.cover.bg_image,
            backgroundColor: theme.cover.bg_color,
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

    static async getPayloadUrlByThemeId(
        themeId: string,
        from: string,
        amount?: string,
        type?: string,
        symbol?: string,
        decimals?: number,
    ) {
        const url = urlcat(apiRoot, 'v1/redpacket/themeById', {
            themeId,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeByIdResponse>(url)

        return {
            themeId,
            url: urlcat(SITE_URL, '/api/rp', {
                'theme-id': themeId,
                usage: 'payload',
                from,
                amount,
                type,
                symbol,
                decimals,
            }),
            backgroundImageUrl: data.cover.bg_image,
            backgroundColor: data.cover.bg_color,
        }
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
        const url = urlcat(apiRoot, 'v1/redpacket/themeById', {
            rpid,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeByIdResponse>(url)
        // Just discard default theme, and this RedPacket will be treated as created from Mask
        if (data.is_default) return null

        return {
            themeId: data.tid,
            backgroundImageUrl: data.normal.bg_image,
            backgroundColor: data.normal.bg_color,
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

    static async createPublicKey(
        themeId: string,
        shareFrom: string,
        payloads: FireflyRedPacketAPI.StrategyPayload[],
    ): Promise<HexString> {
        const url = urlcat(apiRoot, '/v1/redpacket/createPublicKey')
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
        postOn: FireflyRedPacketAPI.PostOn[],
        publicKey: string,
    ): Promise<void> {
        const url = urlcat(apiRoot, '/v1/redpacket/updateClaimStrategy')
        await fetchFireflyJSON(url, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                rpid,
                postReaction: reactions,
                postOn,
                claimPlatform,
            }),
        })
    }

    static async createClaimSignature(
        options: FireflyRedPacketAPI.CheckClaimStrategyStatusOptions,
    ): Promise<HexString> {
        const url = urlcat(apiRoot, '/v1/redpacket/claim')
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
        if (!from) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const url = urlcat(apiRoot, '/v1/redpacket/history', {
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
            data.cursor ? createNextIndicator(indicator, data.cursor.toString()) : undefined,
        )
    }

    static async getClaimHistory(
        redpacket_id: string,
        indicator?: PageIndicator,
    ): Promise<FireflyRedPacketAPI.RedPacketClaimListInfo> {
        const url = urlcat(apiRoot, '/v1/redpacket/claimHistory', {
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
        const url = urlcat(apiRoot, '/v1/redpacket/checkClaimStrategyStatus')
        return fetchFireflyJSON<FireflyRedPacketAPI.CheckClaimStrategyStatusResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
    }
    static async finishClaiming(
        rpid: string,
        platform: FireflyRedPacketAPI.PlatformType,
        profileId: string,
        handle: string,
        txHash: string,
    ) {
        const url = urlcat(apiRoot, '/v1/redpacket/finishClaiming')
        return fetchFireflyJSON<FireflyRedPacketAPI.Response<string>>(url, {
            method: 'POST',
            body: JSON.stringify({
                rpid,
                claimPlatform: platform,
                claimProfileId: profileId,
                claimHandle: handle,
                txHash,
            }),
        })
    }
    static updateApiRoot(url: string) {
        apiRoot = url
    }
}
