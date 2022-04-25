import { type Option, type Result, Err, None } from 'ts-results'
import type { ProfileIdentifier } from './profile'
import type { PostIdentifier } from './post'
import type { ECKeyIdentifier } from './ec-key'
import type { PostIVIdentifier } from './post-iv'

export abstract class Identifier {
    abstract toText(): string
    abstract [Symbol.toStringTag]: string
    /** @deprecated */
    equals(x: Identifier | undefined | null) {
        return x === this
    }
    /** We mark this as private because it's encouraged to use toText(). toString is for JavaScript runtime accidentally calling. */
    private toString() {
        return this.toText()
    }
    static from(x: string): Option<Identifier> {
        // this method will be override in ./utils
        return None
    }
    /** @deprecated */
    static fromString(x: string, ctor: typeof ProfileIdentifier): Result<ProfileIdentifier, Error>
    static fromString(x: string, ctor: typeof PostIdentifier): Result<PostIdentifier, Error>
    static fromString(x: string, ctor: typeof ECKeyIdentifier): Result<ECKeyIdentifier, Error>
    static fromString(x: string, ctor: typeof PostIVIdentifier): Result<PostIVIdentifier, Error>
    static fromString(x: string): Result<Identifier, Error>
    static fromString(x: string, ctor?: Function): Result<Identifier, Error> {
        const result = this.from(x).toResult(new Error())
        if (!ctor) return result
        if (result.err) return result
        if (result.val instanceof ctor) return result
        return Err(new Error())
    }
    static [Symbol.hasInstance](x: unknown): boolean {
        // this method will be override in ./utils
        return false
    }
}
