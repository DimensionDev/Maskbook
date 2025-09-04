import type { SessionClient } from '@lens-protocol/client'
import { LensSession } from '@masknet/web3-providers'
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm'

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7

export function createLensSession(profileId: string, sessionClient: SessionClient) {
    const now = Date.now()
    const credentialsRe = sessionClient.getCredentials()
    if (credentialsRe.isErr()) {
        throw new Error(credentialsRe.error.message ?? 'Failed to get lens credentials')
    }
    const credentials = credentialsRe.value
    if (!credentials) throw new Error('Failed to get lens credentials')

    const authenticatedRes = sessionClient.getAuthenticatedUser()
    if (!authenticatedRes.isOk()) {
        throw new Error(authenticatedRes.error.message)
    }
    const authenticated = authenticatedRes.value

    const address = authenticated.address

    const { accessToken, refreshToken } = credentials

    return new LensSession(profileId, accessToken, now, now + SEVEN_DAYS, refreshToken, address ?? ZERO_ADDRESS)
}
