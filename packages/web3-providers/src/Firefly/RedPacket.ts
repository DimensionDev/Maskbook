import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import { FireflyRedPacketAPI } from '../entry-types.js'

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

    static async getTheme(options: FireflyRedPacketAPI.ThemeOptions) {
        const url = urlcat(FIREFLY_ROOT_URL, 'v1/redpacket/themeById', options)
        const { data } = await fetchJSON<FireflyRedPacketAPI.ThemeByIdResponse>(url)
        return data
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
}
