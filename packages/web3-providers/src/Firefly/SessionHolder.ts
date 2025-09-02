import type { FireflySession } from './Session.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { SessionHolder } from '../Session/SessionHolder.js'
import type { NextFetchersOptions } from '../helpers/getNextFetchers.js'

class FireflySessionHolder extends SessionHolder<FireflySession> {
    fetchWithSessionGiven(session: FireflySession) {
        return <T>(url: string, init?: RequestInit) => {
            return fetchJSON<T>(url, {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${session.token}` },
            })
        }
    }

    override async fetchWithSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        const authToken = this.sessionRequired.token

        return fetchJSON<T>(
            url,
            {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${authToken}` },
            },
            options,
        )
    }

    override fetchWithoutSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        return fetchJSON<T>(url, init, options)
    }
}

export const fireflySessionHolder = new FireflySessionHolder()
