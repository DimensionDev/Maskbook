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
import { FireflyRedPacketAPI, type FireflyResponse } from '../entry-types.js'

const siteType = getSiteType()
const SITE_URL = siteType === EnhanceableSite.Firefly ? location.origin : 'https://firefly.mask.social'
const FIREFLY_ROOT_URL =
    process.env.NEXT_PUBLIC_FIREFLY_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'https://api-dev.firefly.land' : 'https://api.firefly.land')

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
    static async getThemes() {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/themeList')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.ThemeListResponse>(url)
        return data.list
    }
    static async createTheme(options: FireflyRedPacketAPI.CreateThemeOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/createTheme')
        const res = await fetchFireflyJSON<FireflyRedPacketAPI.CreateThemeResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
        return res.data.tid
    }
    static async parse(options: FireflyRedPacketAPI.ParseOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/misc/redpacket/parse')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.ParseResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
        return data
    }
    static async getPayloadUrls(from: string, amount?: string, type?: string, symbol?: string, decimals?: number) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/themeList')
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

    static async getTheme(options: FireflyRedPacketAPI.ThemeOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, 'v1/redpacket/themeById', options)
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeByIdResponse>(url)
        return data
    }

    static async getPayloadUrlByThemeId(
        themeId: string,
        from: string,
        amount?: string,
        type?: string,
        symbol?: string,
        decimals?: number,
    ) {
        const data = await FireflyRedPacket.getTheme({ themeId })
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

    /**
     * @deprecated
     */
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
        strategies: FireflyRedPacketAPI.StrategyPayload[],
    ): Promise<HexString> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/createPublicKey')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.PublicKeyResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                themeId,
                shareFrom,
                claimFrom: FireflyRedPacketAPI.SourceType.MaskNetwork,
                claimStrategy: JSON.stringify(strategies),
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/updateClaimStrategy')
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
    ): Promise<HexString | undefined> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claim')
        const { data } = await fetchFireflyJSON<FireflyRedPacketAPI.ClaimResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        })
        return data?.signedMessage
    }

    static async getHistory<
        T extends FireflyRedPacketAPI.ActionType,
        R = T extends FireflyRedPacketAPI.ActionType.Claim ? FireflyRedPacketAPI.RedPacketClaimedInfo
        :   FireflyRedPacketAPI.RedPacketSentInfo,
    >(actionType: T, from: HexString, indicator?: PageIndicator): Promise<Pageable<R, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/history', {
            address: from,
            redpacketType: actionType,
            cursor: indicator?.id,
            claimFrom: FireflyRedPacketAPI.SourceType.MaskNetwork,
            size: 20,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.HistoryResponse>(url)
        return createPageable(
            data.list.map((v) => ({ ...v, chain_id: Number(v.chain_id) })) as R[],
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, data.cursor.toString()) : undefined,
        )
    }

    static async getClaimHistory(
        redpacket_id: string,
        chainId?: number,
        indicator?: PageIndicator,
    ): Promise<FireflyRedPacketAPI.RedPacketClaimListInfo> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claimHistory', {
            redpacketId: redpacket_id,
            chain_id: chainId,
            cursor: indicator?.id,
            size: 20,
        })
        const { data } = await fetchJSON<FireflyRedPacketAPI.ClaimHistoryResponse>(url)
        return { ...data, chain_id: Number(data.chain_id) } as FireflyRedPacketAPI.RedPacketClaimListInfo
    }

    static async checkClaimStrategyStatus(options: FireflyRedPacketAPI.CheckClaimStrategyStatusOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/redpacket/checkClaimStrategyStatus')
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/finishClaiming')
        return fetchFireflyJSON<FireflyResponse<string>>(url, {
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
}
