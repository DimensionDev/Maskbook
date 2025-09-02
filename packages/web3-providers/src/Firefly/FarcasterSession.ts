import urlcat from 'urlcat'

import { SessionType, type Session } from '../types/Session.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { BaseSession } from '../Session/Session.js'

export const WARPCAST_ROOT_URL_V2 = 'https://api.warpcast.com/v2'
export const FAKE_SIGNER_REQUEST_TOKEN = 'fake_signer_request_token'

export enum FarcasterSponsorship {
    Firefly = 'firefly',
}

export class FarcasterSession extends BaseSession implements Session {
    constructor(
        /**
         * Fid
         */
        profileId: string,
        /**
         * the private key of the signer
         */
        token: string,
        createdAt: number,
        expiresAt: number,
        public signerRequestToken?: string,
        public channelToken?: string,
        public sponsorshipSignature?: string,
        public walletAddress?: string,
    ) {
        super(SessionType.Farcaster, profileId, token, createdAt, expiresAt)
    }

    override serialize(): `${SessionType}:${string}:${string}:${string}` {
        return [
            super.serialize(),
            this.signerRequestToken ?? '',
            this.channelToken ?? '',
            this.sponsorshipSignature ?? '',
        ].join(':') as `${SessionType}:${string}:${string}:${string}`
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed')
    }

    async destroy(): Promise<void> {
        const url = urlcat(WARPCAST_ROOT_URL_V2, '/auth')
        const response = await fetchJSON<{
            result: {
                success: boolean
            }
        }>(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({
                method: 'revokeToken',
                params: {
                    timestamp: this.createdAt,
                },
            }),
        })

        // indicate the session is destroyed
        this.expiresAt = 0

        if (!response.result.success) throw new Error('Failed to destroy the session.')
        return
    }

    static isGrantByPermission(
        session: Session | null,
        // if strict is true, the session must have a valid signer request token
        strict = false,
    ): session is FarcasterSession & { signerRequestToken: string } {
        if (!session) return false
        const token = (session as FarcasterSession).signerRequestToken
        return (
            session.type === SessionType.Farcaster &&
            !!token &&
            // strict mode
            (strict ? token !== FAKE_SIGNER_REQUEST_TOKEN : true)
        )
    }

    static isSponsorship(
        session: Session | null,
        strict = false,
    ): session is FarcasterSession & { signerRequestToken: string; sponsorshipSignature: string } {
        if (!session) return false
        return (
            FarcasterSession.isGrantByPermission(session, strict) &&
            !!(session as FarcasterSession).sponsorshipSignature
        )
    }

    static isRelayService(session: Session | null): session is FarcasterSession & { channelToken: string } {
        if (!session) return false
        return session.type === 'Farcaster' && !!(session as FarcasterSession).channelToken
    }

    static isLoginByWallet(session: Session | null): session is FarcasterSession & { walletAddress: string } {
        if (!session) return false
        return session.type === 'Farcaster' && !!(session as FarcasterSession).walletAddress
    }
}
