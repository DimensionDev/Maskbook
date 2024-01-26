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

const SITE_URL = 'https://firefly-staging.mask.io'
const FIREFLY_ROOT_URL = 'https://api.firefly.land'

export class FireflyRedPacket {
    static async getThemeSettings(from: string, amount?: string, type?: string, symbol?: string, decimals?: number): Promise<FireflyRedPacketAPI.ThemeSettings[]> {
        return [
            {
                // TODO: Change this id to keep it the same as the backend
                id: '0',
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: 'golden-flower',
                    usage: 'payload',
                    from,
                    amount,
                    type,
                    symbol,
                    decimals
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
                    decimals
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
                    decimals
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
        payloads: FireflyRedPacketAPI.StrategyPayload[],
    ): Promise<`0x${string}`> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/createPublicKey')
        const { data } = await fetchJSON<FireflyRedPacketAPI.PublicKeyResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                themeId,
                claimFrom: FireflyRedPacketAPI.SourceType.FireflyPC,
                claimStrategy: JSON.stringify(payloads),
            }),
        })

        return data.publicKey
    }

    static async updateClaimStrategy(rpid: string, reactions: FireflyRedPacketAPI.PostReaction[]): Promise<void> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/updateClaimStrategy')
        await fetchJSON(url, {
            method: 'POST',
            body: JSON.stringify({
                rpid,
                postReaction: reactions,
            }),
        })
    }

    static async createClaimSignature(
        rpid: string,
        from: `0x${string}`,
        reaction: FireflyRedPacketAPI.ProfileReaction,
    ): Promise<`0x${string}`> {
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/history')
        const { data } = await fetchJSON<FireflyRedPacketAPI.HistoryResponse>(url, {
            method: 'GET',
            body: JSON.stringify({
                address: from,
                redpacketType: actionType,
                claimFrom: FireflyRedPacketAPI.SourceType.FireflyPC,
                cursor: indicator?.id,
                size: 20,
            }),
        })

        return createPageable(
            data.list as R[],
            createIndicator(indicator),
            createNextIndicator(indicator, data.cursor.toString()),
        )
    }
}
