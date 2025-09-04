import { FireflyAlreadyBoundError } from '@masknet/shared-base'
import {
    FarcasterSession,
    FIREFLY_ROOT_URL,
    fireflySessionHolder,
    patchFarcasterSessionRequired,
    resolveFireflyResponseData,
    type LensSession,
} from '@masknet/web3-providers'
import { SessionType, type FireflyConfigAPI, type Session } from '@masknet/web3-providers/types'
import urlcat from 'urlcat'

async function bindFarcasterSessionToFirefly(session: FarcasterSession, signal?: AbortSignal) {
    const isGrantByPermission = FarcasterSession.isGrantByPermission(session, true)
    const isRelayService = FarcasterSession.isRelayService(session)

    if (!isGrantByPermission && !isRelayService)
        throw new Error(
            '[bindFarcasterSessionToFirefly] Only grant-by-permission or relay service sessions are allowed.',
        )

    const response = await fireflySessionHolder.fetch<FireflyConfigAPI.BindResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v3/user/bindFarcaster'),
        {
            method: 'POST',
            body: JSON.stringify({
                token: isGrantByPermission ? session.signerRequestToken : undefined,
                channelToken: isRelayService ? session.channelToken : undefined,
                isForce: false,
            }),
            signal,
        },
    )

    if (response.error?.some((x) => x.includes('Farcaster binding timed out'))) {
        throw new Error('Bind Farcaster account to Firefly timeout.')
    }

    // If the farcaster is already bound to another account, throw an error.
    if (
        isRelayService &&
        response.error?.some((x) => x.includes('This farcaster already bound to the other account'))
    ) {
        throw new FireflyAlreadyBoundError('Farcaster')
    }

    const data = resolveFireflyResponseData(response)
    patchFarcasterSessionRequired(session, data.fid, data.farcaster_signer_private_key)
    return data
}

async function bindLensToFirefly(session: LensSession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<FireflyConfigAPI.BindResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v3/user/bindLens'),
        {
            method: 'POST',
            body: JSON.stringify({
                accessToken: session.token,
                isForce: false,
                version: 'v3',
            }),
            signal,
        },
    )

    if (response.error?.some((x) => x.includes('This wallet already bound to the other account'))) {
        throw new FireflyAlreadyBoundError('Lens')
    }

    const data = resolveFireflyResponseData(response)
    return data
}

/**
 * Bind a lens or farcaster session to the currently logged-in Firefly session.
 * @param session
 * @param signal
 * @returns
 */
export async function bindFireflySession(session: Session, signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession()
    if (session.type === SessionType.Farcaster) {
        return bindFarcasterSessionToFirefly(session as FarcasterSession, signal)
    } else if (session.type === SessionType.Lens) {
        return bindLensToFirefly(session as LensSession, signal)
    } else if (session.type === SessionType.Firefly) {
        throw new Error('Not allowed')
    }
    throw new Error(`Unknown session type: ${session.type}`)
}
