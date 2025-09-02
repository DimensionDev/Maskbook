export enum SessionType {
    Apple = 'Apple',
    Email = 'Email',
    Google = 'Google',
    Telegram = 'Telegram',
    Twitter = 'Twitter',
    Lens = 'Lens',
    Farcaster = 'Farcaster',
    Firefly = 'Firefly',
    Bsky = 'Bsky',
}

export interface Session {
    profileId: string | number

    /**
     * The type of social platform that the session is associated with.
     */
    type: SessionType

    /**
     * The secret associated with the authenticated account.
     * It's typically used to validate the authenticity of the user in subsequent
     * requests to a server or API.
     */
    token: string

    /**
     * Represents the time at which the session was established or last updated.
     * It's represented as a UNIX timestamp, counting the number of seconds since
     * January 1, 1970 (the UNIX epoch).
     */
    createdAt: number

    /**
     * Specifies when the authentication or session will expire.
     * It's represented as a UNIX timestamp, which counts the number of seconds
     * since January 1, 1970 (known as the UNIX epoch).
     * A value of 0 indicates that the session has no expiration.
     */
    expiresAt: number

    /**
     * Serializes the session data into a string format.
     * This can be useful for storing or transmitting the session data.
     *
     * @returns A string representation of the session.
     */
    serialize(): string

    /**
     * Refreshes the session, typically by acquiring a new token or extending the
     * expiration time. This method might make an asynchronous call to a backend
     * server to perform the refresh operation.
     *
     * @returns A promise that resolves when the session is successfully refreshed.
     */
    refresh(): Promise<void>

    /**
     * Destroys the session, ending the authenticated state. This might involve
     * invalidating the token on a backend server or performing other cleanup operations.
     *
     * @returns A promise that resolves when the session is successfully destroyed.
     */
    destroy(): Promise<void>
}
