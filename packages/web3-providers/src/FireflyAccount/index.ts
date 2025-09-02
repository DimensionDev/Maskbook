import type { FireflySession } from '../Firefly/Session'
import type { Session } from '../types/Session'
import type { Social } from '../types/Social'

type AccountOrigin = 'inherent' | 'sync'

export interface FireflyAccount {
    origin?: AccountOrigin
    profile: Social.Profile
    session: Session
    fireflySession?: FireflySession
}
export interface AccountOptions {
    // set the account as the current account, default: true
    setAsCurrent?: boolean | ((account: FireflyAccount) => Promise<void>)
    // skip the belongs to check, default: false
    skipBelongsToCheck?: boolean
    // resume accounts from firefly, default: false
    skipResumeFireflyAccounts?: boolean
    // resume the firefly session, default: false
    skipResumeFireflySession?: boolean
    // skip reporting farcaster signer, default: true
    skipReportFarcasterSigner?: boolean
    // skip syncing accounts, default: false
    skipSyncAccounts?: boolean
    // early return signal
    signal?: AbortSignal
}

export async function addAccount(_account: FireflyAccount, _options?: AccountOptions) {
    return true
}
