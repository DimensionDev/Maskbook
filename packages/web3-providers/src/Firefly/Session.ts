import { encodeAsciiPayload, encodeNoAsciiPayload } from '../helpers/encodeSessionPayload.js'
import { BaseSession } from '../Session/Session.js'
import { SessionType, type Session } from '../types/Session.js'

export type FireflySessionSignature = {
    address: string
    message: string
    signature: string
}

export type FireflySessionPayload = {
    /**
     * indicate a new firefly binding when it was created
     */
    isNew?: boolean

    /**
     * numeric user ID
     */
    uid?: string
    /**
     * UUID of the user
     */
    accountId?: string
    avatar?: string | null
    displayName?: string | null
}

export class FireflySession extends BaseSession implements Session {
    constructor(
        accountId: string,
        accessToken: string,
        public parent: Session | null,
        public signature: FireflySessionSignature | null,
        /**
         * @deprecated
         * This field always false. Use `payload.isNew` instead
         */
        public isNew?: boolean,
        public payload?: FireflySessionPayload,
    ) {
        super(SessionType.Firefly, accountId, accessToken, 0, 0)
    }

    /**
     * For users after this patch use accountId in UUID format for events.
     * For legacy users use profileId in numeric format for events.
     */
    get accountIdForEvent() {
        return this.payload?.accountId ?? this.profileId
    }

    override serialize(): `${SessionType}:${string}:${string}:${string}` {
        return [
            super.serialize(),
            // parent session
            this.parent ? btoa(this.parent.serialize()) : '',
            // signature if session created by signing a message
            this.signature ? encodeAsciiPayload(this.signature) : '',
            // isNew flag
            this.isNew ? '1' : '0',
            // extra data payload
            this.payload ? encodeNoAsciiPayload(this.payload) : '',
        ].join(':') as `${SessionType}:${string}:${string}:${string}`
    }

    override async refresh(): Promise<void> {
        // throw new NotAllowedError()
        throw new Error('Not allowed')
    }

    override async destroy(): Promise<void> {
        // throw new NotAllowedError()
        throw new Error('Not allowed')
    }
}
