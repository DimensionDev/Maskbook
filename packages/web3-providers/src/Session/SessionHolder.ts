import type { Session } from '../types/Session.js'

export class SessionHolder<T extends Session> {
    protected internalSession: T | null = null

    private removeQueries() {
        if (!this.session) return
    }

    get session() {
        return this.internalSession
    }

    get sessionRequired() {
        if (!this.internalSession) throw new Error('No session found.')
        return this.internalSession
    }

    assertSession(message?: string) {
        try {
            return this.sessionRequired
        } catch (error: unknown) {
            if (typeof message === 'string') throw new Error(message)
            throw error
        }
    }

    refreshSession(): Promise<T> {
        throw new Error('Not implemented')
    }

    resumeSession(session: T) {
        this.removeQueries()
        this.internalSession = session
    }

    removeSession() {
        this.removeQueries()
        this.internalSession = null
    }

    withSession<K extends (session: T | null) => unknown>(callback: K, required = false) {
        return callback(required ? this.sessionRequired : this.session) as ReturnType<K>
    }

    fetchWithSession<T>(url: string, init?: RequestInit, options?: { withSession?: boolean }): Promise<T> {
        throw new Error('Not implemented')
    }

    fetchWithoutSession<T>(url: string, init?: RequestInit, options?: { withSession?: boolean }): Promise<T> {
        throw new Error('Not implemented')
    }

    /**
     * Fetch w/ or w/o session.
     *
     * withSession = true: fetch with session
     * withSession = false: fetch without session
     * withSession = undefined: fetch with session if session exists
     * @param url
     * @param init
     * @param withSession
     */
    fetch<T>(url: string, init?: RequestInit, options?: { withSession?: boolean }): Promise<T> {
        if (options?.withSession === true) return this.fetchWithSession<T>(url, init, options)
        if (options?.withSession === false) return this.fetchWithoutSession<T>(url, init, options)
        if (this.session) return this.fetchWithSession<T>(url, init, options)
        return this.fetchWithoutSession<T>(url, init, options)
    }
}
