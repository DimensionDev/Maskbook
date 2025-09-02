import { NOT_DEPEND_SECRET } from './constants'
import { FAKE_SIGNER_REQUEST_TOKEN, type FarcasterSession } from './FarcasterSession'

export function patchFarcasterSessionRequired(session: FarcasterSession, fid: number, token: string | undefined) {
    if (session.profileId === NOT_DEPEND_SECRET) {
        session.profileId = fid.toString()
    }
    if (session.token === NOT_DEPEND_SECRET) {
        if (!token) throw new Error(`Failed to patch signer key to Farcaster session: ${fid}`)

        session.token = token
        session.signerRequestToken = FAKE_SIGNER_REQUEST_TOKEN
    }
    return session
}
