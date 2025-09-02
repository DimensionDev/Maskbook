import {
    FarcasterSession,
    FIREFLY_ROOT_URL,
    FireflySession,
    patchFarcasterSessionRequired,
    resolveFireflyResponseData,
} from '@masknet/web3-providers'
import type { FireflyConfigAPI, Session } from '@masknet/web3-providers/types'
import urlcat from 'urlcat'

export async function restoreFireflySessionFromFarcaster(session: FarcasterSession, signal?: AbortSignal) {
    const isGrantByPermission = FarcasterSession.isGrantByPermission(session, true)
    const isRelayService = FarcasterSession.isRelayService(session)
    if (!isGrantByPermission && !isRelayService)
        throw new Error('[restoreFireflySession] Only grant-by-permission or relay service sessions are allowed.')

    const url = urlcat(FIREFLY_ROOT_URL, '/v3/auth/farcaster/login')
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: isGrantByPermission ? session.signerRequestToken : undefined,
            channelToken: isRelayService ? session.channelToken : undefined,
        }),
        signal,
    })

    const json: FireflyConfigAPI.LoginResponse = await response.json()
    if (!response.ok && json.error?.includes('Farcaster login timed out'))
        throw new Error('[restoreFireflySession] Farcaster login timed out.')

    const data = resolveFireflyResponseData(json)
    if (data.fid && data.accountId && data.accessToken) {
        patchFarcasterSessionRequired(session as FarcasterSession, data.fid, data.farcaster_signer_private_key)
        return new FireflySession(data.uid ?? data.accountId, data.accessToken, session, null, false, data)
    }
    throw new Error('[restoreFireflySession] Failed to restore firefly session.')
}

/**
 * Restore firefly session from a lens or farcaster session.
 * @param session
 * @param signal
 * @returns
 */
export function restoreFireflySession(session: Session, signal?: AbortSignal) {
    if (session.type === 'Farcaster') {
        return restoreFireflySessionFromFarcaster(session as FarcasterSession, signal)
    } else if (session.type === 'Firefly') {
        throw new Error('[restoreFireflySession] Firefly session is not allowed.')
    }
    throw new Error(`[restoreFireflySession] Unknown session type: ${session.type}`)
}
