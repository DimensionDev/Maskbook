import { type SessionType, type Session } from '../types/Session.js'

export abstract class BaseSession implements Session {
    constructor(
        public type: SessionType,
        public profileId: string,
        public token: string,
        public createdAt: number,
        public expiresAt: number,
    ) {}

    serialize(): `${SessionType}:${string}` {
        const body = JSON.stringify({
            type: this.type,
            token: this.token,
            profileId: this.profileId,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
        })

        return `${this.type}:${btoa(body)}`
    }

    abstract refresh(): Promise<void>

    abstract destroy(): Promise<void>
}
