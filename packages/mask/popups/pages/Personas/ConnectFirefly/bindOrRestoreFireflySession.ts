import { fireflySessionHolder } from '@masknet/web3-providers'
import type { Session } from '@masknet/web3-providers/types'
import { bindFireflySession } from './bindFireflySession'
import { restoreFireflySession } from './restoreFireflySession'

export async function bindOrRestoreFireflySession(session: Session, signal?: AbortSignal) {
    try {
        if (fireflySessionHolder.session) {
            await bindFireflySession(session, signal)

            // this will return the existing session
            return fireflySessionHolder.assertSession(
                '[bindOrRestoreFireflySession] Failed to bind farcaster session with firefly.',
            )
        } else {
            throw new Error('[bindOrRestoreFireflySession] Firefly session is not available.')
        }
    } catch (error) {
        // this will create a new session
        return restoreFireflySession(session, signal)
    }
}
