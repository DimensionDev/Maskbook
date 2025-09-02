export class AbortError extends Error {
    override name = 'AbortError'

    constructor(message = 'Aborted') {
        super(message)
    }

    static is(error: unknown) {
        return error instanceof AbortError || (error instanceof DOMException && error.name === 'AbortError')
    }
}

export class FarcasterPatchSignerError extends Error {
    override name = 'FarcasterPatchSignerError'

    constructor(public fid: number) {
        super(`Failed to patch signer key to Farcaster session: ${fid}`)
    }
}

export class TimeoutError extends Error {
    override name = 'TimeoutError'

    constructor(message?: string) {
        super(message ?? 'Timeout.')
    }
}

export class FireflyBindTimeoutError extends Error {
    override name = 'FireflyBindTimeoutError'
    constructor(public source: string) {
        super(`Bind ${source} account to Firefly timeout.`)
    }
}
export class FireflyAlreadyBoundError extends Error {
    override name = 'FireflyAlreadyBoundError'

    constructor(public source: string) {
        super(`This ${source} account has already bound to another Firefly account.`)
    }
}
