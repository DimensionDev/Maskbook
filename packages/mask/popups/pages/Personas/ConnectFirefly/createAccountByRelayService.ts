import { fetchJSON } from '@masknet/web3-providers/helpers'
import { FarcasterSession, getFarcasterProfileById, type FireflyAccount } from '@masknet/web3-providers'
import urlcat from 'urlcat'
import { bindOrRestoreFireflySession } from './bindOrRestoreFireflySession'

const FARCASTER_REPLY_URL = 'https://relay.farcaster.xyz'
const NOT_DEPEND_SECRET = '[TO_BE_REPLACED_LATER]'

interface FarcasterReplyResponse {
    channelToken: string
    url: string
    // the same as url
    connectUri: string
    // cspell: disable-next-line
    /** @example dpO7VRkrPcwyLhyFZ */
    nonce: string
}

async function createSession(signal?: AbortSignal) {
    const url = urlcat(FARCASTER_REPLY_URL, '/v1/channel')
    const response = await fetchJSON<FarcasterReplyResponse>(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // cspell: disable-next-line
            siweUri: 'https://firefly.social',
            domain: 'firefly.social',
        }),
        signal,
    })

    const now = Date.now()
    const farcasterSession = new FarcasterSession(
        NOT_DEPEND_SECRET,
        NOT_DEPEND_SECRET,
        now,
        now,
        '',
        response.channelToken,
    )

    return {
        deeplink: response.connectUri,
        session: farcasterSession,
    }
}

export async function createAccountByRelayService(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createSession(signal)

    // present QR code to the user or open the link in a new tab
    callback?.(deeplink)

    // polling for the session to be ready
    const fireflySession = await bindOrRestoreFireflySession(session, signal)
    console.log('fireflySession', fireflySession)

    // profile id is available after the session is ready
    const profile = await getFarcasterProfileById(session.profileId)

    return {
        origin: 'sync',
        session,
        profile,
        fireflySession,
    } satisfies FireflyAccount
}
